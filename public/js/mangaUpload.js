const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file");
const titleInput = document.getElementById("title");
const authorsInput = document.getElementById("authors");
const groupsInput = document.getElementById("groups");
const originalsInput = document.getElementById("originals");
const charactorsInput = document.getElementById("charactors");
const tagsInput = document.getElementById("tags");

function splitComma(str) {
  if (str == "") {
    return [];
  } else {
    return str.split(",").map((item) => item.trim());
  }
}

fileInput.addEventListener("change", () => {
  if (fileInput.isDefaultNamespace.length > 0) {
    const fileName = fileInput.files[0].name;
    const baseName = fileName.replace(/\.[^/.]+$/, "");

    if (!titleInput.value) {
      titleInput.value = baseName;
    }
  }
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = fileInput.files[0];
  const title = titleInput.value;
  const authors = splitComma(authorsInput.value);
  const groups = splitComma(groupsInput.value);
  const originals = splitComma(originalsInput.value);
  const charactors = splitComma(charactorsInput.value);
  const tags = splitComma(tagsInput.value);

  const mangaDataJson = {
    title,
    authors,
    groups,
    originals,
    charactors,
    tags,
  };

  const uploadEndPoint = "/api/post-manga-upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("data",JSON.stringify(mangaDataJson));
  
  fetch(uploadEndPoint, {
    method: "POST",
    body:formData,
  }).then((res) => {
    if (!res.ok) {
      alert("マンガのアップロードに失敗しました");
    }
  });
});
