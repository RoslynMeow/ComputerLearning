# CSLearning

知识图谱教学网站原型。2D/3D 视图共用 `data/catalog.json` 中的知识点和关系。

## 本地预览

在项目目录运行：

```powershell
python -m http.server 4173
```

打开 <http://localhost:4173/>。由于页面通过 HTTP 读取 JSON 数据，请勿直接用 `file://` 打开 `index.html`。

## 3D 图谱控制

- 左键拖动：旋转视角
- 右键拖动：平移相机
- 滚轮：缩放
- 点击画布后，W/A/S/D 移动，Q/E 升降
- 悬停知识点查看摘要，点击知识点打开学习卡片
- 当前视角、缩放、平移和选中节点保存在浏览器 `localStorage` 中；不需要账户，但不会跨设备同步
- 3D 控制仅在较宽屏幕显示；手机继续使用纵向 2D 图谱
- 图谱模式、缩放、平移和相机位置会保存在当前浏览器中，下次打开自动恢复；数据仅保存在本机浏览器，不跨设备同步

## 新增知识点

参见 [`docs/ADD_KNOWLEDGE.md`](docs/ADD_KNOWLEDGE.md)，使用 `scripts/add-knowledge.mjs` 生成节点与讲义草稿。
