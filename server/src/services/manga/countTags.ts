import { paths } from "../../config/paths.js";
import { MetadataListSchema } from "@comic-viewer/shared";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema.js";
import { logger } from "../../utils/logger.js";

export const countTags = async () => {
  const metadataList = await readJsonWithSchemaSafe(paths.data.metadataFile, MetadataListSchema, []);
  const allTagData = metadataList.map((item) => item.tags).flat();
  const tagFrequency = allTagData.reduce<Record<string, number>>((acc, str) => {
    acc[str] = (acc[str] || 0) + 1;
    return acc;
  }, {});

  const sortedTagData = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]);
  const tagDataWithCount = sortedTagData.map(([str, count]) => {
    return { str, count };
  });

  logger.log("[CountTag]タグを集計しました タグ総数:",tagDataWithCount.length);
  return tagDataWithCount;
};
