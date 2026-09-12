# Codex Markdown 主题：卡点已解决

更新时间：2026-09-12（标题色与引用线宽修复后）。

## 当前状态

已完成三轮修复并在真实 Codex 界面确认生效。当前没有阻塞，主题已应用，样式保持观察器已运行。

最新实时状态：

- `applied: true`
- `observerInstalled: true`
- `markdownMounted: true`
- `markdownEditors: 1`
- 编辑器正文：15px，行高 26.25px
- 一级标题：28px，字重 750
- 表头：15px，字重 750，蓝色强调

本轮新增状态：

- Markdown 文件无序列表将 `-`、`*`、`+` 实时显示为蓝色圆点。
- Markdown 文件有序列表按序号位数分配标记宽度，10、11、12 不再拆行。
- 文件标题 H1–H6 使用用户指定颜色；加粗强调与 H1 同为红色。
- 助手回复固定为内容栏左对齐，短回复不再居中。
- 对话表格与正文左边界对齐，列内容正常换行，末列不再被挤出容器。
- 对话引用块只保留主题的蓝色左边框，Codex 原生第二条装饰线已关闭。

本轮新增：

- H1–H6 使用用户指定颜色：`rgb(231,77,71)`、`rgb(215,148,64)`、`rgb(7,170,246)`、`rgb(163,110,251)`、`rgb(109,215,215)`、`rgb(175,191,5)`。
- 加粗强调与 H1 使用同一红色。
- 聊天引用和 Markdown 引用左边框由 3px 改为 1.5px。

## 根因

原交接中关于“文档在另一个 renderer”的猜测未得到实证。实时 DOM 确认：主页面 `app://-/index.html` 同时包含两套渲染结构：

- 聊天消息：`_MarkdownRoot_*`。
- Markdown 文件：CodeMirror 的 `.cm-content[data-language="markdown"]`，标题为 `.file-editor-heading-*`，表格为 `.cm-markdown-table-*`。

旧 CSS 漏掉 CodeMirror，因此即便注入成功，右侧文档也没有变化。之前 `markdownRoot: false` 还混淆了“样式是否注入”和“内容是否挂载”。

## 完成的修改

- `codex-theme.mjs`：新增 CodeMirror 主题，动态识别加粗/行内代码类名；不再以 Markdown 是否存在筛选可信窗口；加入样式保留观察器并在 restore 时清理；分开统计聊天/文件 renderer，输出计算样式与窗口身份；操作前校验端口归属，CDP 失败时关闭连接。
- `README.md`：使用方法、状态字段、验证记录和生命周期限制。
- 旧脚本及旧 handoff 保留在 `backups/`。

### 第二轮布局修复

- 删除助手回复继承的居中边距，按助手消息容器精准设置 `width:100%`、`margin-inline:0` 和左对齐。
- 不再给对话表格强制 `display:block`；表格容器取消原生负边距，滚动层负责窄窗口溢出。
- 表头和单元格允许换行及长文本断行，首列、末列保持在正文边界内。
- CodeMirror 列表行增加实时标记着色、固定标记宽度和悬挂缩进。
- 新增六组标题色变量；文件编辑器按 H1–H4 分色，聊天 Markdown 支持 H1–H6 分色。

### 第三轮列表、引用和强调色修复

- 观察器实时识别 CodeMirror 列表行，并标记为 `unordered` 或 `ordered`。
- 无序列表隐藏源码符号，以 `::before` 显示圆点；有序列表保留原序号。
- 有序标记按字符数动态分配像素宽度，避免两位数序号因固定窄宽而换行。
- 关闭聊天引用块原生 `::after`，只保留主题左边框。
- H1 和加粗强调统一为红色 `rgb(231,77,71)`。

### 第四轮标题色与引用线宽修复

- 将六个 `--md-heading-*` 变量替换为用户提供的 RGB 值。
- 统一聊天 Markdown、文件编辑器标题和动态加粗 token 的颜色来源。
- 将两处引用边框设置为 `1.5px solid var(--md-accent)`，并继续关闭 Codex 原生第二条装饰线。

## 验证结果

- `node --check codex-theme.mjs`：通过。
- 原文档正文从 13px 变为 15px；一级标题从 22px/500 变为 28px/750；表头蓝色并加粗。截图已目视检查。
- 测试文档实际挂载：6 个标题、1 个表格、1 个代码块。加粗、行内代码、列表和引用已视觉检查。
- 已注入后切换到新文档无需再次 apply，计算样式仍正确。
- 移除 style 后观察器自动补回：通过。
- restore 后 applied=false、observerInstalled=false，正文恢复 13px；随后 status 保持关闭：通过。
- 连续 apply 不重复创建 style：通过。
- 第一轮验证结束时原文档 SHA-256 一致，主题脚本没有文档写入逻辑。原文档随后于 2026-09-12 16:59 被其他活动更新，当前哈希与 16:50 的验证记录不同，不能再将旧哈希当作当前文件校验值。
- 应用包未修改；未进行完整应用重启测试。
- 真实对话中助手根节点：`width:736px` 与父容器一致，左右 margin 均为 0，`text-align:left`。
- 真实三列表格：容器由 `x=288.19px` 的左越界恢复为与正文相同的 `x=355.94px`；表格宽度未超出 736px 容器，首末列视觉检查通过。
- 测试文件无序列表：标记伪元素内容为 `•`，固定宽度 16px，形成悬挂缩进。
- 原文档有序列表：8、9 的标记宽度约 20.4px；10、11、12 的标记宽度约 30.6px，均保持单行。
- 引用块计算样式：仅主题左边框；原生 `::after` 的 `content:none`。
- 标题计算色已核对：H1 `rgb(231,77,71)`、H2 `rgb(215,148,64)`、H3 `rgb(7,170,246)`；其余级别使用对应变量。
- 引用计算样式：`border-left: 1px`（CSS 声明为 1.5px，当前设备像素取整），`::after` 为 `none`。

证据文件：

- `tmp/theme-verification.json`
- `tmp/codex-theme-before.png`
- `tmp/codex-theme-after.png`
- `tmp/codex-theme-fixture.png`
- `tmp/20260912_markdown-theme-check_v1.md`
- `tmp/document-before.sha256`
- `tmp/layout-verification.json`
- `tmp/codex-theme-layout-after.png`
- `tmp/codex-theme-headings-list-after.png`
- `tmp/quotes-lists-after-navigation.json`
- `tmp/codex-theme-quote-single-border.png`
- `tmp/codex-theme-list-markers-final.png`
- `tmp/codex-theme-heading-border-final.png`

## 剩余边界

无阻塞。主题仅在当前页面生命周期内保持；完整重载、应用重启或新窗口需再次执行 `apply`。当前仅验证暗色界面，长文档计数仅反映挂载节点。当前 Codex 将文件编辑器中的 H5、H6 也标记为 `.file-editor-heading-4`，因此文件面板无法仅靠 CSS 将 H4–H6 再细分；聊天 Markdown 不受此限制。内部 DOM/CSS 在 Codex 升级后可能变化，需要维护者复核。

## 后续接手方式

正常使用无需继续开发。应用重启后运行：

```bash
node codex-theme.mjs apply
node codex-theme.mjs status
```

若 Codex 升级后样式失效，优先检查 `.cm-content[data-language="markdown"]`、`.file-editor-heading-*` 和 `.cm-markdown-*` 是否仍存在，再根据 `status` 中的 `applied`、`markdownEditors` 与 `editorComputed` 区分注入失败、节点未挂载或选择器变化。
