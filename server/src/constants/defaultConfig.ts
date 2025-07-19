import { ServerConfig, UserConfig } from "../schemas/configSchema";

export const defaultUserCongfig:UserConfig = {
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
  }
}

export const defaultServerCongfig:ServerConfig = {
  dataDirectory: "K:\\Document\\Comic\\Data",
  cache: {
    enable: true,
    size: 100
  }
}