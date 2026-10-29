// macOS 内建人脸框（Vision VNDetectFaceRectanglesRequest）：输入一张图 → 输出「x y w h」（0–1，原点左上）；没脸输出 none
import Vision
import Foundation
let handler = VNImageRequestHandler(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let req = VNDetectFaceRectanglesRequest()
do {
    try handler.perform([req])
    guard let f = (req.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) else { print("none"); exit(0) }
    let b = f.boundingBox
    print(String(format: "%.4f %.4f %.4f %.4f", b.minX, 1 - b.maxY, b.width, b.height))
} catch { print("none"); exit(0) }
