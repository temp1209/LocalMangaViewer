const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const { getConfig } = require("../utils/configManager");

const uploadDirectory = getConfig().uploadDirectory;

async function handlePdfUpload(file,id) {
  const pdfBytes = file.buffer;
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const outputDir = path.join(uploadDirectory, id);
  fs.mkdirSync(outputDir);

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
    singlePagePdf.addPage(copiedPage);
    const singlePageBytes = await singlePagePdf.save();

    await sharp(singlePageBytes)
      .png()
      .resize({ width: Math.floor(width / 2) })
      .toFile(path.join(outputDir, `page_${i + 1}.png`));
  }

  console.log("PDFファイルを分割しました:", outputDir);
}

module.exports = handlePdfUpload;