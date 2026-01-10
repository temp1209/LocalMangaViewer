export const defaultConfig = {
  user: {
    viewer: {
      pageDirection: "left" as "left" | "right",
      keyboardShortcuts: {
        right: ["ArrowRight", "d"],
        left: ["ArrowLeft", "a"],
      },
    },
    ui: {
      theme: "dark" as "dark" | "light" | "auto",
      pageLimit: 10,
    },
  },
  server: {
    dataDirectory: "K:\\Document\\Comic\\Data",
  },
};
