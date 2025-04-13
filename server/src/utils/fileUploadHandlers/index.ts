import { handleZipUpload } from "./handleZip";
import { handlePdfUpload } from "./handlePdf";

type UploadHandler = (file: Express.Multer.File, id: string, extractDirectory: string) => Promise<boolean>;

const mimeHandlers:Record<string,UploadHandler> = {
  "application/zip": handleZipUpload,
  "application/x-zip-compressed": handleZipUpload,
  "application/pdf": handlePdfUpload,
};

export default mimeHandlers;
