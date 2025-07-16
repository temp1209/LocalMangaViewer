import path from "path";
import { getConfig } from "./configManager";

const dataDirectory = getConfig().dataDirectory;

export const paths = {
  data: {
    root: dataDirectory,
    manga: path.join(dataDirectory, "manga"),
    metadataFile: path.join(dataDirectory, "metadata", "metadata.json"),
    uploads: path.join(dataDirectory, "uploads"),
    dummyCover: path.join(dataDirectory, "manga", "DummyCover.png"),
  },
};
