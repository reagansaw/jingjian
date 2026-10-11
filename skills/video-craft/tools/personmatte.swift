// 人像抠图（Apple Vision，accurate 档）：把一个文件夹里的 jpg 逐张出遮罩 PNG（白=人）
// 用法：personmatte <输入文件夹> <输出文件夹>
import Foundation
import Vision
import AppKit
import CoreImage
let inDir = CommandLine.arguments[1], outDir = CommandLine.arguments[2]
try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)
let files = try! FileManager.default.contentsOfDirectory(atPath: inDir).filter { $0.hasSuffix(".jpg") }.sorted()
let ctx = CIContext()
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
for f in files {
    guard let img = NSImage(contentsOfFile: inDir + "/" + f), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { continue }
    try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
    guard let pb = req.results?.first?.pixelBuffer else { print("no mask", f); continue }
    let ci = CIImage(cvPixelBuffer: pb)
    let sx = CGFloat(cg.width) / ci.extent.width, sy = CGFloat(cg.height) / ci.extent.height
    let scaled = ci.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
    guard let outCG = ctx.createCGImage(scaled, from: CGRect(x: 0, y: 0, width: cg.width, height: cg.height), format: .L8, colorSpace: CGColorSpaceCreateDeviceGray()) else { continue }
    let rep = NSBitmapImageRep(cgImage: outCG)
    try? rep.representation(using: .png, properties: [:])?.write(to: URL(fileURLWithPath: outDir + "/" + f.replacingOccurrences(of: ".jpg", with: ".png")))
}
print("done", files.count)
