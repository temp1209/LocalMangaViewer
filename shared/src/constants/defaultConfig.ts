import { Config } from "../types/config";

export const defaultConfig: Config = {
  user: {
    viewer: {
      pageDirection: "left",
      keyboardShortcuts: {
        nextPage: ["ArrowLeft", "a"],
        prevPage: ["ArrowRight", "d"],
      },
    },
    ui: {
      theme: "dark",
      pageLimit: 10,
    },
  },
  server: {
    dataDirectory: "K:\\Document\\Comic\\Data",
  },
};
