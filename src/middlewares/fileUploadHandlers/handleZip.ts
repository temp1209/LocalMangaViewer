const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { getConfig } = require("../utils/configManager.ts");

const uploadDirectory = getConfig().uploadDirectory;

async function handleZipUpload(file,id) {
  const outputDir = path.join(uploadDirectory, id);
  fs.mkdirSync(outputDir);

  const zip = new AdmZip(file.buffer);
  zip.extractAllTo(outputDir, true);

  console.log("ZIPファイルを解凍しました:", outputDir);
}

module.exports = handleZipUpload;