import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { rm } from "fs/promises";

// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async function () {
  const distPath = path.join(__dirname, "../dist");

  await rm(distPath, { recursive: true });
})();
