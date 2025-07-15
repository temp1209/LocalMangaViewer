import { UserConfig } from "../schemas/userConfigSchema";

export const defaultUserCongnfig:UserConfig = {
  dataDirectory: "K:\\Document\\Comic\\Data",
  viewer: {
    pageDirection: "left",
    keyboardShortcuts: {
      nextPage: [
        "ArrowLeft",
        "a"
      ],
      prevPage: [
        "ArrowRight",
        "d"
      ]
    }
  },
  ui: {
    theme: "dark",
    pageLimit: 10
  },
  advanced: {
    enableCache: true,
    cacheSize: 100
  }
}