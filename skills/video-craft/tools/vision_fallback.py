#!/usr/bin/env python3
"""量脸 / 抠像的跨平台后备：Windows、Linux，或 Mac 上没编译 Swift 小工具时用。
macOS 有编译好的 facebox / personmatte / subjectlift 就照旧用 Apple Vision（快、作者验证过）；否则走这里：
  量脸：MediaPipe Face Detector（blaze_face_short_range，近距离人脸，口播刚好）。模型第一次用自动下载到 ~/.cache/video-craft/。
  抠像：rembg。人像默认 u2net_human_seg，任意主体默认 isnet-general-use；模型第一次用自动下载到 ~/.rembg/models/（旧版 rembg 是 ~/.u2net/）。
        实测（M 系列 Mac，CPU，720×1280）：u2net_human_seg 每帧约 0.6 秒、isnet-general-use 约 1.4 秒；
        birefnet-portrait 边缘最好，但 CPU 上一帧要好几分钟，只在有 NVIDIA 显卡时用：设环境变量 VC_MATTE_MODEL=birefnet-portrait。
安装（一次）：python -m pip install mediapipe "rembg[cpu]" pillow      有 NVIDIA 显卡：把 rembg[cpu] 换成 rembg[gpu]
强制走后备（在 Mac 上测试用）：设环境变量 VC_VISION=fallback。"""
import os, sys, urllib.request

CACHE = os.path.join(os.path.expanduser("~"), ".cache", "video-craft")
# 切块后假脸（楼、树、湖）分数可到 0.70，口播近景的真脸 ≥ 0.79：取 0.75。代价：全身远景的小脸会漏，那种画面自己看一眼。
FACE_MIN_SCORE = float(os.environ.get("VC_FACE_MIN_SCORE", "0.75"))
FACE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"


def use_native(binary):
    """macOS 且 Swift 小工具已编译 → 用 Apple Vision。"""
    return sys.platform == "darwin" and os.path.exists(binary) and os.environ.get("VC_VISION") != "fallback"


def _need(mod, pip_name):
    try:
        return __import__(mod)
    except ImportError:
        sys.exit(f"缺少 {mod}：先跑  python -m pip install {pip_name}\n"
                 f"（macOS 也可以改用系统自带 Vision：照 tools/README.md 先 swiftc 编译对应的 .swift）")


_detector = None


def face_box(image_path):
    """一张图 → (x, y, w, h)，0–1、原点左上，取最大的那张脸；没脸 → None。和 facebox.swift 的输出同一个约定。"""
    global _detector
    if _detector is None:
        _need("mediapipe", "mediapipe")
        from mediapipe.tasks.python import BaseOptions
        from mediapipe.tasks.python import vision
        os.makedirs(CACHE, exist_ok=True)
        model = os.path.join(CACHE, "blaze_face_short_range.tflite")
        if not os.path.exists(model):
            print("第一次用：下载人脸模型 →", model, file=sys.stderr)
            urllib.request.urlretrieve(FACE_MODEL_URL, model)
        _detector = vision.FaceDetector.create_from_options(
            vision.FaceDetectorOptions(base_options=BaseOptions(model_asset_path=model), min_detection_confidence=FACE_MIN_SCORE))
    import mediapipe as mp
    import numpy as np
    from PIL import Image
    img = Image.open(image_path).convert("RGB")
    W, H = img.size
    # 这个模型吃正方形小图：整张竖屏直接丢进去，脸会被压小、常漏掉。所以切成上下重叠的正方形逐块找，
    # 再换回整张图的坐标，取分数最高的那张脸（2026-11 用一条 9:16 口播实测：整张 8 帧漏 3 帧，切块 0 帧漏；整支 79 帧和 Mac Vision 比，0 张假脸）。
    side = min(W, H)
    n = max(1, -(-2 * max(W, H) // side) - 1)            # 每块重叠一半
    span = max(W, H) - side
    best = None
    for i in range(n):
        off = round(span * i / (n - 1)) if n > 1 else 0
        box = (0, off, side, off + side) if H >= W else (off, 0, off + side, side)
        tile = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(np.asarray(img.crop(box))))
        for d in _detector.detect(tile).detections:
            s = d.categories[0].score
            if best is None or s > best[0]:
                b = d.bounding_box
                best = (s, box[0] + b.origin_x, box[1] + b.origin_y, b.width, b.height)
    if best is None:
        return None
    _, x, y, w, h = best
    return x / W, y / H, w / W, h / H


_sessions = {}


def mask(image_path, kind="person"):
    """一张图 → 灰阶遮罩（PIL "L"，主体 = 白），和原图一样大。kind = person（只抠人）或 subject（前景主体）。"""
    _need("rembg", '"rembg[cpu]"')
    from rembg import new_session, remove
    from PIL import Image
    model = os.environ.get("VC_MATTE_MODEL") or ("u2net_human_seg" if kind == "person" else "isnet-general-use")
    if model not in _sessions:
        print("抠像模型：", model, "（第一次用会先下载）", file=sys.stderr)
        _sessions[model] = new_session(model)
    rgb = Image.open(image_path).convert("RGB")
    m = remove(rgb, session=_sessions[model], only_mask=True)
    return m.convert("L").resize(rgb.size, Image.BICUBIC)
