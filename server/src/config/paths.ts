import path from "path";
import { getServerConfig } from "../services/config/getServerConfig";

const dataDirectory = "K:\\Document\\Comic\\Data"

export const paths = {
  data: {
    root: dataDirectory,
    manga: path.join(dataDirectory, "manga"),
    metadataFile: path.join(dataDirectory, "metadata", "metadata.json"),
    uploads: path.join(dataDirectory, "uploads"),
    dummyCover: path.join(dataDirectory, "manga", "DummyCover.png"),
  },
};
