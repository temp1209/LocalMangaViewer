const handleZipUpload = require("./handleZip");
const handlePdfUpload = require("./handlePdf");

module.exports = {
  "application/zip": handleZipUpload,
  "application/x-zip-compressed": handleZipUpload,
  "application/pdf": handlePdfUpload,
};