import { Config } from "../types/config.js";

export const defaultConfig: Config = {
  user: {
    viewer: {
      pageDirection: "left",
      keyboardShortcuts: {
        right: ["ArrowRight", "d"],
        left: ["ArrowLeft", "a"],
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
