import { readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function readDirectoryRecursively(dir, fileList = []) {
    const files = await readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await stat(filePath);

        if (stats.isDirectory()) {
            // 如果是目录，则递归读取
            await readDirectoryRecursively(filePath, fileList);
        } else {
            // 如果是文件，则添加到列表
            fileList.push(filePath);
        }
    }

    return fileList;
}

function addJsExtensionToImports(code) {
    // 正则表达式解释：
    // - `import\s+`: 匹配 "import" 关键字后跟随任意数量的空白字符
    // - `(\{[^}]*\}|[\w\s,]*|['"][^'"]*['"])`: 匹配 import 后的内容（可能是花括号、单个名称或字符串）
    // - `\s+from\s+`: 匹配 "from" 关键字及前后空白字符
    // - `(['"])(.*?)\1`: 匹配文件路径，并捕获路径部分（排除引号）
    const regex = /import\s+(\{[^}]*\}|[\w\s,]*|['"`][^'"`]*['"`])\s+from\s+(['"`])(.*?)\2/g;

    return code.replace(regex, (match, p1, p2, p3) => {
        // 如果路径已经包含.js扩展，则不进行替换
        if (p3.endsWith('.js')) {
            return match;
        }

        // 重构 import 语句，添加 .js 扩展名
        return `import ${p1} from ${p2}${p3}.js${p2}`;
    });
}

; (async function init() {

    const dist = path.join(__dirname, "../dist")
    const files = await readDirectoryRecursively(dist);

    for (let i = 0; i < files.length; i++) {
        const fullPath = files[i];
        const content = await readFile(fullPath, "utf-8");
        const afterContent = addJsExtensionToImports(content);
        await writeFile(fullPath, afterContent)
    }

})();