import { handleZipUpload } from "./handleZip.js";
import { handlePdfUpload } from "./handlePdf.js";

type UploadHandler = (file: Express.Multer.File, id: string, extractDirectory: string) => Promise<boolean>;

const mimeHandlers:Record<string,UploadHandler> = {
  "application/zip": handleZipUpload,
  "application/x-zip-compressed": handleZipUpload,
  "application/pdf": handlePdfUpload,
};

export default mimeHandlers;
