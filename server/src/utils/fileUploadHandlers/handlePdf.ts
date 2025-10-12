import { promises as fs } from "fs";
import path from "path";
import { pdfToPng } from "pdf-to-png-converter";
import { logger } from "../logger.js";
import { writeFile } from "fs/promises";

export async function handlePdfUpload(
  file: Express.Multer.File,
  id: string,
  extractDirectory: string
): Promise<boolean> {
  const pdfPath = file.path;
  logger.info(`[PDF Upload]PDFファイルを受け取りました`);
  logger.log(`[PDF Upload]pdfPath:${pdfPath},extractDir:${extractDirectory}`);

  if (!extractDirectory) {
    logger.error("[PDF Upload]アップロードディレクトリが指定されていません");
    return false;
  }

  const outputDir = path.join(extractDirectory, id);
  logger.log("[PDF Upload]アップロードディレクトリを作成します:", outputDir);
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (err) {
    logger.error("[PDF Upload]出力ディレクトリの作成に失敗しました:", err);
    return false;
  }

  try {
    const pngFiles = await pdfToPng(pdfPath, {
      viewportScale: 3.0,
      outputFileMaskFunc: (pageNum) => `page_${pageNum}.png`,
    });
    logger.log("[PDF Upload]PDFファイルを分割しました");

    pngFiles.forEach(async (file) => {
      await writeFile(path.join(outputDir,file.name),file.content);
    });
  } catch (err) {
    logger.error("[PDF Upload]PDFの変換に失敗しました:", err);
    return false;
  }

  return true;
}
