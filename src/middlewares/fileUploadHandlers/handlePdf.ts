const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const { getConfig } = require("../utils/configManager.ts");
const { pdfToPng } = require("pdf-to-png-converter");

const uploadDirectory = getConfig().uploadDirectory;

async function handlePdfUpload(file, id) {
  const pdfPath = file.path;
  console.log(pdfPath);
  const outputDir = path.join(uploadDirectory, id);
  fs.mkdirSync(outputDir);

  await pdfToPng(pdfPath, {
    viewportScale: 3.0,
    outputFolder: outputDir,
    outputFileMaskFunc: (pageNum) => `page_${pageNum}.png`,
  });

  console.log("PDFファイルを分割しました:", outputDir);
}

module.exports = handlePdfUpload;
