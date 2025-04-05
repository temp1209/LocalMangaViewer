import { MetadataItem } from "@mytypes/metadata";

const uploadForm = document.getElementById("upload-form")! as HTMLFormElement;
const fileInput = document.getElementById("file")! as HTMLInputElement;
const titleInput = document.getElementById("title")! as HTMLInputElement;

function splitComma(str:string | null | undefined) {
  if (!str) {
    return [];
  } else {
    return str.split(",").map((item) => item.trim());
  }
}

document.getElementById("file")?.addEventListener("change", () => {
  const files = fileInput.files;
  if (files && files.length > 0) {
    const fileName = files[0].name;
    const baseName = fileName.replace(/\.[^/.]+$/, "");

    if (!titleInput.value) {
      titleInput.value = baseName;
    }
  }
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(uploadForm);
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const authors = splitComma(formData.get("authors")?.toString());
  const groups = splitComma(formData.get("groups")?.toString());
  const originals = splitComma(formData.get("originals")?.toString());
  const characters = splitComma(formData.get("characters")?.toString());
  const tags = splitComma(formData.get("tags")?.toString());

  const mangaDataJson = {
    title,
    authors,
    groups,
    originals,
    characters,
    tags
  };

  const uploadEndPoint = "/api/post-manga-upload";
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("data",JSON.stringify(mangaDataJson));
  
  fetch(uploadEndPoint, {
    method: "POST",
    body:uploadData,
  }).then(async (res) => {
    const result = await res.json();
    if(res.ok){
      console.log(result.message);
    }else{
      console.error(result.message);
    }
  }).catch((e)=>{
    console.error(e);
  });
});
