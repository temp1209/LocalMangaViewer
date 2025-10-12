import { API_ENDPOINTS } from "@comic-viewer/shared";

// DOM要素の取得
const backButton = document.getElementById("back-button") as HTMLButtonElement;
const refreshButton = document.getElementById("refresh-button") as HTMLButtonElement;
const exportButton = document.getElementById("export-button") as HTMLButtonElement;

async function loadTagList() {
  try {
    const response = await fetch(API_ENDPOINTS.tag.list);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tagData = await response.json();
    displayTagList(tagData);
  } catch (error) {
    console.error("タグ一覧の読み込みに失敗しました:", error);
    alert("タグ一覧の読み込みに失敗しました。");
  }
}

function displayTagList(tagList: {str: string, count: number}[]) {
  console.log(tagList);

  const tagListContainer = document.getElementById("tag-list-container");
  
  if (!tagListContainer) {
    console.error("tag-list-containerが見つかりません");
    return;
  }

  // 既存のタグをクリア
  tagListContainer.innerHTML = "";

  tagList.forEach(({str, count}) => {
    const tagItemElement = document.createElement("div");
    tagItemElement.className = "tag-item";
    tagItemElement.addEventListener("click", () => {
      window.location.href = `../mangaList/mangaList.html?tag=${encodeURIComponent(str)}`;
    });

    const tagStrElement = document.createElement("div");
    tagStrElement.className = "tag-str";
    tagStrElement.textContent = str;
    tagItemElement.appendChild(tagStrElement);

    const tagCountElement = document.createElement("div");
    tagCountElement.className = "tag-count";
    tagCountElement.textContent = count.toString();
    tagItemElement.appendChild(tagCountElement);

    tagListContainer.appendChild(tagItemElement);
  });
}

// タグ一覧をエクスポート
function exportTagList() {
  const tagListContainer = document.getElementById("tag-list-container");
  if (!tagListContainer) return;

  const tagItems = tagListContainer.querySelectorAll(".tag-item");
  const tagData: {str: string, count: number}[] = [];

  tagItems.forEach((item) => {
    const strElement = item.querySelector(".tag-str");
    const countElement = item.querySelector(".tag-count");
    
    if (strElement && countElement) {
      tagData.push({
        str: strElement.textContent || "",
        count: parseInt(countElement.textContent || "0")
      });
    }
  });

  const dataStr = JSON.stringify(tagData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'tag-list.json';
  link.click();
}

// イベントリスナーの設定
function setupEventListeners() {
  // 戻るボタン
  backButton?.addEventListener('click', () => {
    window.location.href = '../mangaList/mangaList.html';
  });
  
  // 更新ボタン
  refreshButton?.addEventListener('click', () => {
    loadTagList();
  });
  
  // エクスポートボタン
  exportButton?.addEventListener('click', exportTagList);
}

// 初期化
function initTaglist() {
  loadTagList();
  setupEventListeners();
}

document.addEventListener("DOMContentLoaded", initTaglist);