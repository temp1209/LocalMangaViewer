import {promises as fs} from "fs";

export const writeJson = async (filePath:string,data:Object):Promise<boolean> =>{
  try{
    const result = await fs.writeFile(filePath,JSON.stringify(data,null,2),"utf-8");
    return true;
  }catch(e){
    console.error(`[error:writeJson] ファイル書き込みに失敗しました\nfilepath: ${filePath}`);
    return false;
  }
}