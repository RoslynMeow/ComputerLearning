import fs from "node:fs";
import path from "node:path";

// 页面在运行时通过 fetch 读取 data/catalog.json，并链接 drafts 下的讲义，
// 这些文件不会被 Vite 打包进 dist，需要在构建后复制。
const root = process.cwd();
const dist = path.join(root, "dist");

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

copyDir(path.join(root, "data"), path.join(dist, "data"));
copyDir(path.join(root, "drafts"), path.join(dist, "drafts"));
console.log("已复制 data/ 与 drafts/ 到 dist/。");
