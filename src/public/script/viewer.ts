const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // フォルダ名を取得
let images:string[] = [];
let currentIndex = 0;

async function fetchImages() {
  const res = await fetch(`/api/get-pages/${id}`);
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
  const currentImageElement = document.getElementById("comic-page")! as HTMLImageElement;
  currentImageElement.src = `${images[currentIndex]}`;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "d") {
    prevPage();
  } else if (event.key === "ArrowLeft" || event.key === "a") {
    nextPage();
  }
});

document.getElementById('back-button')?.addEventListener('click', () => {
  window.history.back();
});

fetchImages();