# 新增知识点

CSLearning 的知识图谱数据位于 `data/catalog.json`。页面从此文件读取知识点、知识域、讲解、易错点和练习；节点坐标由图谱布局自动计算，不需要手动指定。

## 使用脚手架

在项目根目录运行：

```powershell
node scripts/add-knowledge.mjs `
  --id cache-coherence `
  --title "缓存一致性" `
  --en "Cache Coherence" `
  --domain hardware `
  --book "计算机组成原理 · Cache" `
  --summary "多处理器如何协调缓存中的共享数据。" `
  --goal "能解释缓存一致性要解决的问题。" `
  --pre cache,memory-hierarchy `
  --ext cpu-pipeline
```

先加 `--dry-run` 可只检查参数和关系，不写入文件。

脚手架会：

1. 检查 ID、知识域、重复项和前置知识是否存在；
2. 拒绝造成必需前置关系循环的变更；
3. 将新节点追加到 `data/catalog.json`，标记为草稿；
4. 生成 `content/drafts/<id>.md`，包含讲义、例题、误区、练习和实验的写作模板。

重载网页后，新节点会按依赖深度和知识域自动排布。草稿节点先显示基础介绍和关系自测；完成讲义后，将 `lessonLibrary`、`lessonNotes`、`exerciseBank` 中对应的草稿内容替换成正式内容。

## 数据约定

- `pre`：必须先理解的知识点；形成有向无环图。
- `ext`：后续可学或相关联的知识点；不作为解锁条件。
- `group`：必须是 `groupMeta` 中已经定义的知识域。
- `entryPoint: true`：标记唯一学习起点；它必须没有前置知识，图谱会画特殊箭头指向它。
- 不要为了图形效果添加并不存在的依赖；可选关联应放在 `ext`。
- 内容要标出适用条件、例题推导和常见误区；历史信息需要可核验来源。

若要更换学习起点，使用 `--start`；起点不能有 `--pre`。脚手架会清除旧起点标记，并把旧入口接到新入口之后，以保持单一入口。

## 2D / 3D 关系

2D 与 3D 共用相同节点和边。2D 使用自动生成的平面坐标；3D 在此基础上按必需前置深度增加 Z 坐标。新增节点不需要另写三维位置。
