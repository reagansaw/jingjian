// macOS 内建主体去背（Vision VNGenerateForegroundInstanceMaskRequest）：输入一张图 → 输出只有主体、背景透明的 PNG
import Vision
import CoreImage
import Foundation
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let handler = VNImageRequestHandler(url: input)
let request = VNGenerateForegroundInstanceMaskRequest()
do {
    try handler.perform([request])
    guard let result = request.results?.first else { print("no subject"); exit(1) }
    let buffer = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
    let image = CIImage(cvPixelBuffer: buffer)
    try CIContext().writePNGRepresentation(of: image, to: output, format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
    print("ok instances=\(result.allInstances.count)")
} catch { print("error: \(error)"); exit(1) }
