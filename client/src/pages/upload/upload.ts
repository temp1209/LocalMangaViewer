const uploadForm = document.getElementById("upload-form")! as HTMLFormElement;
const fileInput = document.getElementById("file")! as HTMLInputElement;
const titleInput = document.getElementById("title")! as HTMLInputElement;
const uploadButton = document.getElementById("upload-button") as HTMLButtonElement;
const cancelButton = document.getElementById("cancel-button") as HTMLButtonElement;
const backButton = document.getElementById("back-button") as HTMLButtonElement;

function splitComma(str:string | null | undefined) {
  if (!str) {
    return [];
  } else {
    return str.split(",").map((item) => item.trim());
  }
}

// ファイル選択時のタイトル自動設定
fileInput?.addEventListener("change", () => {
  const files = fileInput.files;
  if (files && files.length > 0) {
    const fileName = files[0].name;
    const baseName = fileName.replace(/\.[^/.]+$/, "");

    if (!titleInput.value) {
      titleInput.value = baseName;
    }
  }
});

// アップロード処理
async function handleUpload() {
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

  const uploadEndPoint = "http://localhost:3000/api/post-manga-upload";
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("data", JSON.stringify(mangaDataJson));
  
  try {
    uploadButton.disabled = true;
    uploadButton.textContent = "アップロード中...";
    
    const res = await fetch(uploadEndPoint, {
      method: "POST",
      body: uploadData,
    });
    
    const result = await res.json();
    if (res.ok) {
      alert("アップロードが完了しました！");
      window.location.href = "../mangaList/mangaList.html";
    } else {
      alert(`アップロードに失敗しました: ${result.message}`);
    }
  } catch (e) {
    console.error(e);
    alert("アップロード中にエラーが発生しました。");
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "アップロード";
  }
}

// イベントリスナーの設定
uploadButton?.addEventListener("click", handleUpload);

cancelButton?.addEventListener("click", () => {
  if (confirm("入力内容を破棄しますか？")) {
    uploadForm.reset();
  }
});

backButton?.addEventListener("click", () => {
  window.location.href = "../mangaList/mangaList.html";
});

// Enterキーでのアップロード
uploadForm.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleUpload();
  }
});
