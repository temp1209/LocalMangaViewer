import { UserConfig } from "../../../../shared/src/types";

const APIBase = "http://localhost:3000";

// デフォルト設定
const defaultSettings: UserConfig = {
  dataDirectory: "",
  viewer: {
    pageDirection: "right",
    keyboardShortcuts: {
      nextPage: ["ArrowRight", "d"],
      prevPage: ["ArrowLeft", "a"]
    }
  },
  ui: {
    theme: "auto",
    pageLimit: 10
  },
  advanced: {
    enableCache: true,
    cacheSize: 100
  }
};

// 現在の設定を保持
let currentSettings: UserConfig = { ...defaultSettings };

// DOM要素の取得
const pageDirectionSelect = document.getElementById("page-direction") as HTMLSelectElement;
const themeSelect = document.getElementById("theme") as HTMLSelectElement;
const pageLimitSelect = document.getElementById("page-limit") as HTMLSelectElement;
const dataDirectoryInput = document.getElementById("data-directory") as HTMLInputElement;
const nextPageKeySpan = document.getElementById("next-page-key") as HTMLSpanElement;
const prevPageKeySpan = document.getElementById("prev-page-key") as HTMLSpanElement;

// ボタン要素
const backButton = document.getElementById("back-button") as HTMLButtonElement;
const saveButton = document.getElementById("save-settings") as HTMLButtonElement;
const cancelButton = document.getElementById("cancel-settings") as HTMLButtonElement;
const changeDirectoryButton = document.getElementById("change-directory") as HTMLButtonElement;
const exportButton = document.getElementById("export-settings") as HTMLButtonElement;
const importButton = document.getElementById("import-settings") as HTMLButtonElement;
const resetButton = document.getElementById("reset-settings") as HTMLButtonElement;
const clearCacheButton = document.getElementById("clear-cache") as HTMLButtonElement;

// 設定を読み込む
async function loadSettings() {
  try {
    const response = await fetch(`${APIBase}/api/get-config`);
    if (response.ok) {
      const config = await response.json();
      currentSettings = { ...defaultSettings, ...config };
    } else {
      console.warn("設定の読み込みに失敗しました。デフォルト設定を使用します。");
      currentSettings = { ...defaultSettings };
    }
  } catch (error) {
    console.error("設定の読み込みエラー:", error);
    currentSettings = { ...defaultSettings };
  }
  
  updateUI();
}

// UIを更新
function updateUI() {
  // ページ送り方向
  if (pageDirectionSelect && currentSettings.viewer?.pageDirection) {
    pageDirectionSelect.value = currentSettings.viewer.pageDirection;
  }
  
  // テーマ
  if (themeSelect && currentSettings.ui?.theme) {
    themeSelect.value = currentSettings.ui.theme;
  }
  
  // ページ制限
  if (pageLimitSelect && currentSettings.ui?.pageLimit) {
    pageLimitSelect.value = currentSettings.ui.pageLimit.toString();
  }
  
  // データディレクトリ
  if (dataDirectoryInput && currentSettings.dataDirectory) {
    dataDirectoryInput.value = currentSettings.dataDirectory;
  }
  
  // キーボードショートカット表示
  updateShortcutsDisplay();
}

// キーボードショートカット表示を更新
function updateShortcutsDisplay() {
  if (nextPageKeySpan && currentSettings.viewer?.keyboardShortcuts) {
    nextPageKeySpan.textContent = currentSettings.viewer.keyboardShortcuts.nextPage.join(", ");
  }
  
  if (prevPageKeySpan && currentSettings.viewer?.keyboardShortcuts) {
    prevPageKeySpan.textContent = currentSettings.viewer.keyboardShortcuts.prevPage.join(", ");
  }
}

// 設定を保存
async function saveSettings() {
  // UIから設定を取得
  const newSettings: UserConfig = {
    dataDirectory: currentSettings.dataDirectory,
    viewer: {
      pageDirection: pageDirectionSelect?.value as 'right' | 'left' || 'right',
      keyboardShortcuts: {
        nextPage: pageDirectionSelect?.value === 'right' ? ["ArrowRight", "d"] : ["ArrowLeft", "a"],
        prevPage: pageDirectionSelect?.value === 'right' ? ["ArrowLeft", "a"] : ["ArrowRight", "d"]
      }
    },
    ui: {
      theme: themeSelect?.value as 'dark' | 'light' | 'auto' || 'auto',
      pageLimit: parseInt(pageLimitSelect?.value || '10')
    },
    advanced: {
      enableCache: currentSettings.advanced?.enableCache ?? true,
      cacheSize: currentSettings.advanced?.cacheSize ?? 100
    }
  };
  
  try {
    const response = await fetch(`${APIBase}/api/save-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSettings)
    });
    
    if (response.ok) {
      currentSettings = newSettings;
      updateShortcutsDisplay();
      alert("設定を保存しました。");
    } else {
      alert("設定の保存に失敗しました。");
    }
  } catch (error) {
    console.error("設定保存エラー:", error);
    alert("設定の保存に失敗しました。");
  }
}

// 設定をリセット
function resetSettings() {
  if (confirm("すべての設定をデフォルトにリセットしますか？")) {
    currentSettings = { ...defaultSettings };
    updateUI();
    alert("設定をリセットしました。保存ボタンを押して確定してください。");
  }
}

// 設定をエクスポート
function exportSettings() {
  const dataStr = JSON.stringify(currentSettings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'comic-viewer-settings.json';
  link.click();
}

// 設定をインポート
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          currentSettings = { ...defaultSettings, ...importedSettings };
          updateUI();
          alert("設定をインポートしました。保存ボタンを押して確定してください。");
        } catch (error) {
          alert("設定ファイルの読み込みに失敗しました。");
        }
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
}

// キャッシュをクリア
async function clearCache() {
  if (confirm("キャッシュをクリアしますか？")) {
    try {
      const response = await fetch(`${APIBase}/api/clear-cache`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert("キャッシュをクリアしました。");
      } else {
        alert("キャッシュのクリアに失敗しました。");
      }
    } catch (error) {
      console.error("キャッシュクリアエラー:", error);
      alert("キャッシュのクリアに失敗しました。");
    }
  }
}

// イベントリスナーの設定
function setupEventListeners() {
  // 戻るボタン
  backButton?.addEventListener('click', () => {
    window.location.href = '../mangaList/mangaList.html';
  });
  
  // 保存ボタン
  saveButton?.addEventListener('click', saveSettings);
  
  // キャンセルボタン
  cancelButton?.addEventListener('click', () => {
    window.location.href = '../mangaList/mangaList.html';
  });
  
  // ディレクトリ変更ボタン
  changeDirectoryButton?.addEventListener('click', () => {
    alert("ディレクトリ変更機能は現在開発中です。");
  });
  
  // エクスポートボタン
  exportButton?.addEventListener('click', exportSettings);
  
  // インポートボタン
  importButton?.addEventListener('click', importSettings);
  
  // リセットボタン
  resetButton?.addEventListener('click', resetSettings);
  
  // キャッシュクリアボタン
  clearCacheButton?.addEventListener('click', clearCache);
  
  // ページ送り方向変更時のショートカット表示更新
  pageDirectionSelect?.addEventListener('change', updateShortcutsDisplay);
}

// 初期化
async function init() {
  await loadSettings();
  setupEventListeners();
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init); 