const log = (...args:any[])=>{
  console.log("[log]",...args);
}

const error = (...args:any[])=>{
  console.error("[error]",...args);
}

const info = (...args:any[])=>{
  console.info("[info]",...args);
}

const warn = (...args:any[])=>{
  console.warn("[warn]",...args);
}

export const logger = {
  log,error,info,warn
}