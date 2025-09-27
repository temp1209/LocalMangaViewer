import { Config,defaultConfig } from "shared"

// 設定をサーバーから読み込む
async function loadSettings(): Promise<Config> {
  try {
    const response = await fetch('/api/get-config');
    if (response.ok) {
      const config = await response.json();
      return { ...defaultConfig, ...config };
    }
  } catch (error) {
    console.warn('設定の読み込みに失敗しました。デフォルト設定を使用します。', error);
  }
  return defaultConfig;
}

// 設定をサーバーに保存する
async function saveSettings(config: Config): Promise<boolean> {
  try {
    const response = await fetch('/api/save-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    return response.ok;
  } catch (error) {
    console.error('設定の保存に失敗しました。', error);
    return false;
  }
}

// 設定をUIに反映する
function applySettingsToUI(config: Config) {
  const pageDirectionSelect = document.getElementById('page-direction') as HTMLSelectElement;
  const themeSelect = document.getElementById('theme') as HTMLSelectElement;
  const pageLimitSelect = document.getElementById('page-limit') as HTMLSelectElement;
  const dataDirectoryInput = document.getElementById('data-directory') as HTMLInputElement;

  if (pageDirectionSelect) {
    pageDirectionSelect.value = config.viewer.pageDirection;
  }
  if (themeSelect) {
    themeSelect.value = config.theme;
  }
  if (pageLimitSelect) {
    pageLimitSelect.value = config.pageLimit.toString();
  }
  if (dataDirectoryInput) {
    dataDirectoryInput.value = config.dataDirectory;
  }

  // キーボードショートカットの表示を更新
  updateShortcutsDisplay(config.viewer.pageDirection);
}

// キーボードショートカットの表示を更新
function updateShortcutsDisplay(pageDirection: 'right' | 'left') {
  const nextPageKey = document.getElementById('next-page-key');
  const prevPageKey = document.getElementById('prev-page-key');

  if (pageDirection === 'right') {
    if (nextPageKey) nextPageKey.textContent = '次のページ';
    if (prevPageKey) prevPageKey.textContent = '前のページ';
  } else {
    if (nextPageKey) nextPageKey.textContent = '前のページ';
    if (prevPageKey) prevPageKey.textContent = '次のページ';
  }
}

// UIから設定を取得する
function getSettingsFromUI(): Config {
  const pageDirectionSelect = document.getElementById('page-direction') as HTMLSelectElement;
  const themeSelect = document.getElementById('theme') as HTMLSelectElement;
  const pageLimitSelect = document.getElementById('page-limit') as HTMLSelectElement;
  const dataDirectoryInput = document.getElementById('data-directory') as HTMLInputElement;

  return {
    viewer: {
      pageDirection: (pageDirectionSelect?.value as 'right' | 'left') || 'right'
    },
    theme: (themeSelect?.value as 'dark' | 'light' | 'auto') || 'auto',
    pageLimit: parseInt(pageLimitSelect?.value || '20'),
    dataDirectory: dataDirectoryInput?.value || ''
  };
}

// イベントリスナーの設定
function setupEventListeners() {
  const saveButton = document.getElementById('save-settings');
  const cancelButton = document.getElementById('cancel-settings');
  const resetButton = document.getElementById('reset-settings');
  const clearCacheButton = document.getElementById('clear-cache');
  const exportButton = document.getElementById('export-settings');
  const importButton = document.getElementById('import-settings');
  const changeDirectoryButton = document.getElementById('change-directory');
  const backButton = document.getElementById('back-button');

  // ページ送り方向の変更時にショートカット表示を更新
  const pageDirectionSelect = document.getElementById('page-direction') as HTMLSelectElement;
  if (pageDirectionSelect) {
    pageDirectionSelect.addEventListener('change', () => {
      const direction = pageDirectionSelect.value as 'right' | 'left';
      updateShortcutsDisplay(direction);
    });
  }

  // 保存ボタン
  saveButton?.addEventListener('click', async () => {
    const config = getSettingsFromUI();
    const success = await saveSettings(config);
    
    if (success) {
      alert('設定を保存しました。');
    } else {
      alert('設定の保存に失敗しました。');
    }
  });

  // キャンセルボタン
  cancelButton?.addEventListener('click', () => {
    window.location.href = '../mangaList/mangaList.html';
  });

  // リセットボタン
  resetButton?.addEventListener('click', () => {
    if (confirm('設定をリセットしますか？')) {
      applySettingsToUI(defaultConfig);
    }
  });

  // キャッシュクリアボタン
  clearCacheButton?.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/clear-cache', { method: 'POST' });
      if (response.ok) {
        alert('キャッシュをクリアしました。');
      } else {
        alert('キャッシュのクリアに失敗しました。');
      }
    } catch (error) {
      alert('キャッシュのクリアに失敗しました。');
    }
  });

  // エクスポートボタン
  exportButton?.addEventListener('click', () => {
    const config = getSettingsFromUI();
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'settings.json';
    link.click();
  });

  // インポートボタン
  importButton?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const config = JSON.parse(text);
          applySettingsToUI(config);
          alert('設定をインポートしました。');
        } catch (error) {
          alert('設定のインポートに失敗しました。');
        }
      }
    };
    input.click();
  });

  // ディレクトリ変更ボタン
  changeDirectoryButton?.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/select-directory', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        const dataDirectoryInput = document.getElementById('data-directory') as HTMLInputElement;
        if (dataDirectoryInput && result.directory) {
          dataDirectoryInput.value = result.directory;
        }
      } else {
        alert('ディレクトリの選択に失敗しました。');
      }
    } catch (error) {
      alert('ディレクトリの選択に失敗しました。');
    }
  });

  // 戻るボタン
  backButton?.addEventListener('click', () => {
    window.location.href = '../mangaList/mangaList.html';
  });
}

// 初期化
async function init() {
  const config = await loadSettings();
  applySettingsToUI(config);
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init); 