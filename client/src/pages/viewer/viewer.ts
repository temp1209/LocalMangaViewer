import { API_ENDPOINTS,configSchema } from "@comic-viewer/shared";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // フォルダ名を取得

let images: string[] = [];
let currentIndex = 0;
let viewerSettings: { pageDirection: 'right' | 'left' } = { pageDirection: 'right' };

// 設定を読み込む
async function loadViewerSettings() {
  try {
    const response = await fetch(API_ENDPOINTS.config);
    if (response.ok) {
      const config = configSchema.safeParse(await response.json());
      if (config.success) {
        viewerSettings.pageDirection = config.data.user.viewer.pageDirection;
        console.log("設定を読み込みました:現在のページ送り方向",viewerSettings.pageDirection);
      }
    }
  } catch (error) {
    console.warn("設定の読み込みに失敗しました。デフォルト設定を使用します。");
  }
}

async function fetchImages() {
  const loadingElement = document.getElementById("loading");
  const imageElement = document.getElementById("comic-page") as HTMLImageElement;

  if(!id){
    alert("IDが指定されていません");
    return;
  }
  
  // ローディング開始
  if (loadingElement) loadingElement.style.display = "block";
  if (imageElement) imageElement.style.display = "none";
  
  try {
    const res = await fetch(API_ENDPOINTS.manga.pageList(id));
    
    if (!res.ok) {
      if (res.status === 404) {
        alert("マンガが見つかりませんでした。");
      } else {
        alert("サーバーエラーが発生しました。");
      }
      return;
    }
    
    images = await res.json();

    if (images.length > 0) {
      currentIndex = 0;
      updateImage();
      // ローディング終了
      if (loadingElement) loadingElement.style.display = "none";
      if (imageElement) imageElement.style.display = "block";
    } else {
      alert("画像ファイルが見つかりませんでした。");
    }
  } catch (error) {
    console.error("画像の取得に失敗しました:", error);
    alert("画像の取得に失敗しました。ネットワーク接続を確認してください。");
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
  currentImageElement.src = `/files/${id}/${images[currentIndex]}`;
  console.log(images[currentIndex]);
}

document.addEventListener("keydown", (event) => {
  if (viewerSettings.pageDirection === 'right') {
    // 右矢印で次のページ
    if (event.key === "ArrowRight" || event.key === "d") {
      nextPage();
    } else if (event.key === "ArrowLeft" || event.key === "a") {
      prevPage();
    }
  } else {
    // 左矢印で次のページ
    if (event.key === "ArrowLeft" || event.key === "a") {
      nextPage();
    } else if (event.key === "ArrowRight" || event.key === "d") {
      prevPage();
    }
  }
});

document.getElementById('back-button')?.addEventListener('click', () => {
  window.history.back();
});

// 初期化
async function initViewer() {
  await loadViewerSettings();
  await fetchImages();
}

initViewer();