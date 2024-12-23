const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file");
const titleInput = document.getElementById("title");
const authorsInput = document.getElementById("authors");
const groupsInput = document.getElementById("groups");
const originalsInput = document.getElementById("originals");
const charactorsInput = document.getElementById("charactors");
const tagsInput = document.getElementById("tags");

fileInput.addEventListener("change", () => {
  if (fileInput.isDefaultNamespace.length > 0) {
    const fileName = fileInput.files[0].name;
    const baseName = fileName.replace(/\.[^/.]+$/, "");

    if (!titleInput.value) {
      titleInput.value = baseName;
    }
  }
});
