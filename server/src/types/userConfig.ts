export type UserConfig = {
  dataDirectory: string;
  viewer?: {
    pageDirection: 'right' | 'left'; // 右矢印で次のページか左矢印で次のページか
    keyboardShortcuts: {
      nextPage: string[];
      prevPage: string[];
    };
  };
  ui?: {
    theme: 'dark' | 'light' | 'auto';
    pageLimit: number;
  };
  advanced?: {
    enableCache: boolean;
    cacheSize: number;
  };
}