import fs from "fs";
import path from "path";
import { pdfToPng } from "pdf-to-png-converter";

export async function handlePdfUpload(
  file: Express.Multer.File,
  id: string,
  uploadDirectory: string
): Promise<boolean> {
  const pdfPath = file.path;
  console.log(`[PDF Upload] PDFファイルを受け取りました: ${pdfPath}`);

  if (!uploadDirectory) {
    console.error("[PDF Upload] アップロードディレクトリが指定されていません");
    return false;
  }

  const outputDir = path.join(uploadDirectory, id);
  try {
    fs.mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    console.error("[PDF Upload] 出力ディレクトリの作成に失敗しました:", err);
    return false;
  }

  try {
    await pdfToPng(pdfPath, {
      viewportScale: 3.0,
      outputFolder: outputDir,
      outputFileMaskFunc: (pageNum) => `page_${pageNum}.png`,
    });
    console.log("[PDF Upload] PDFファイルを分割しました:", outputDir);
    return true;
  } catch (err) {
    console.error("[PDF Upload] PDFの変換に失敗しました:", err);
    return false;
  }
}
