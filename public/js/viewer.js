const urlParams = new URLSearchParams(window.location.search);
const folder = urlParams.get("folder"); // フォルダ名を取得
let images = [];
let currentIndex = 0;

async function fetchImages() {
  const res = await fetch(`/api/get-pages/${encodeURIComponent(folder)}`);
  //ページ画像の/manga以下のパスのリスト
  images = await res.json();

  if (images.length > 0) {
    currentIndex = 0;
    updateImage();
  }
}

function nextPage() {
  if (currentIndex < images.length - 1) {
    currentIndex++;
    updateImage();
  }
}

function prevPage() {
  if (currentIndex > 0) {
    currentIndex--;
    updateImage();
  }
}

function updateImage() {
  const currentImageElement = document.getElementById("comic-page");
  currentImageElement.src = `${images[currentIndex]}`;
}

document.addEventListener("keydown", (event) => {
  // 左右の矢印キーのコードを取得
  if (event.key === "ArrowRight" || event.key === "d") {
    prevPage();
  } else if (event.key === "ArrowLeft" || event.key === "a") {
    nextPage();
  }
});

document.getElementById('back-button').addEventListener('click', () => {
  window.history.back();
});

fetchImages();