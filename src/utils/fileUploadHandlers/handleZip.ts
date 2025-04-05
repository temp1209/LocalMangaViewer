import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

export async function handleZipUpload(file: Express.Multer.File, id: string, uploadDirectory: string) {
  const outputDir = path.join(uploadDirectory, id);
  try{
    fs.mkdirSync(outputDir);
    const zip = new AdmZip(file.buffer);
    zip.extractAllTo(outputDir, true);
    console.log("ZIPファイルを解凍しました:", outputDir);
    return true;
  }catch(err){
    console.error("[ZIP Upload] ZIPファイルの解凍に失敗しました",err)
    return false;
  }
}