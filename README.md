# Codex 可读 Markdown 主题

通过本机 CDP 给官方 Codex 应用注入可撤销样式，同时覆盖聊天 Markdown 和右侧 Markdown 文件编辑器。保留原有侧栏缩放 0.88，不改安装包或文档内容。

## 使用

在本目录运行（需要支持内置 `WebSocket` 的 Node.js；本次验证为 v26.8.1）：

```sh
node codex-theme.mjs apply
node codex-theme.mjs status
node codex-theme.mjs restore
```

`apply` 在 CDP 9341 已开放时直接注入；否则先请求正常退出 Codex，再直接运行应用可执行文件并传入 `--remote-debugging-port=9341`。不使用此前多次崩溃的 `open -na` 路径。请保存正在编辑的内容；如果 Codex 拒绝退出，请用 Cmd+Q 退出后在系统终端执行脚本。启动日志保存在 `tmp/codex-launch-*.log`。启动提前退出时仅尝试一次普通启动恢复；端口等待超时不重复重启。

样式在当前页面生命周期内生效，切换任务、打开新的 Markdown 文件会自动匹配；样式节点被移除时会补回。应用重启、整个 renderer 重载或新增窗口后需重新运行 `apply`，脚本不是后台常驻服务。`restore` 同时移除样式并断开观察器。

## 状态含义

- `applied`：主题样式表存在，不等同于文档已显示。
- `observerInstalled`：当前页面已安装样式保留观察器。
- `markdownMounted`：当前 DOM 中存在聊天 Markdown 或 Markdown 文件编辑器。
- `chatRoots` / `markdownEditors`：两种 renderer 分开统计。
- `editorComputed`：实际编辑器正文、标题和表头的计算样式。
- `headings` / `tables` / `codeBlocks`：仅统计当前挂载节点。CodeMirror 会虚拟化长文档，不能据此统计整份文件。
- `targetKind` / `targetUrl`：实际操作的应用窗口。空窗口可以已注入但尚无 Markdown。

主题延续原稿的暗色配色，当前验证范围为暗色界面。Markdown 文件中的列表由 CodeMirror 实时识别：输入 `- `、`* `、`+ ` 后显示圆点，数字列表保留序号；标记宽度随序号位数调整，10、11、12 不会拆行。H1–H6 使用你指定的六组颜色；加粗强调沿用 H1 色。当前 Codex 会把 H5、H6 暴露为与 H4 相同的 DOM 类，因此文件面板中三者保持同色，聊天 Markdown 可按 H1–H6 区分。

对话区的助手回复固定为内容栏左对齐。表格沿用 Codex 自带滚动容器，取消向两侧越界，单元格允许正常换行，窄窗口下仍可横向滚动。

主题依赖 Codex 内部 DOM/CSS，应用升级后如选择器变化需重新核对。

## 2026-09-12 修复记录

根因：右侧文档使用 `.cm-content[data-language="markdown"]` 和 `.file-editor-heading-*` 等 CodeMirror 节点；旧脚本只覆盖聊天 `_MarkdownRoot_`，遗漏文件编辑器。

修复了编辑器标题、正文、表格、引用、列表、代码块等样式；从实际样式表识别动态加粗和行内代码类名；可信主窗口不再要求 Markdown 已挂载才注入；排除 checkout、sandbox 和辅助浮窗；完善状态输出、撤销和 CDP 连接清理。

验证通过：语法检查、原文档实际计算样式和前后截图、包含六级标题/加粗/引用/表格/代码块的测试文档、跨文档动态挂载、样式丢失恢复、重复应用、撤销后保持关闭。第一轮验证结束时原文档 SHA-256 未变；文件随后于 16:59 被其他活动更新，本主题脚本没有文档写入逻辑。未测试应用完整重启，未修改应用包。

- 主脚本：`codex-theme.mjs`
- 修复前备份：`backups/codex-theme_20260912_before-fix.mjs`
- 验证记录：`tmp/theme-verification.json`
- 原文档前后截图：`tmp/codex-theme-before.png`、`tmp/codex-theme-after.png`
- 格式测试截图：`tmp/codex-theme-fixture.png`
- 交接状态：`handoff/codex-theme-markdown/handoff.md`

后续维护：应用升级后，维护者运行 `status`，用实际 Markdown 文件重新检查计算样式与视觉效果。

## 2026-09-12 启动崩溃修复

- 最新直接启动失败已定位：`tmp/codex-launch-1789227233917.log` 报 `electron: --openssl-legacy-provider is not allowed in NODE_OPTIONS`。来源为用户 `.zshrc` 第 153–156 行设置的 `NODE_OPTIONS`，脚本原先将其继承给 Electron。
- `script/codex-launch-env.mjs` 为子进程清除 `NODE_OPTIONS`、`NODE_PATH` 和 `ELECTRON_RUN_AS_NODE`；直接启动与普通启动恢复均使用清理后的环境。不修改全局 shell 设置。
- 该日志证明环境变量导致本次直接启动失败，尚不能证明此前全部 `v8::Context::Exit` 原生崩溃均由它引起。按用户要求保持现有 Codex 运行，本轮不做应用重启测试；最终 CDP 注入仍待完整启动验证。

- 首轮临时停止自动重启，仅避免再次触发启动失败，并未恢复主题功能。
- 后续改为直接启动应用可执行文件，加入退出等待、独立启动日志、提前退出检测和普通启动恢复。
- 验证：语法通过；直接启动在已有实例运行时正常退出并报告实例复用；实际 `apply` 因 Codex 未退出而按预期停止。完整退出后的 CDP 启动和主题注入仍待验证。
- 更正：`allowDevtools=false`、端口未监听和 Chrome 的默认目录策略，都不足以证明此 Codex 构建禁用了 CDP。原生崩溃根因尚未确定。

## 2026-09-12 引用块内边距

- 聊天 Markdown、左侧 Markdown 页面和 CodeMirror 编辑器中的引用块左右内边距统一为 `20px`。
- 代码块（截图所示的三反引号 `pre` 区域）左右内边距也统一为 `20px`，并使用 `!important` 覆盖 Codex 原生规则。

## 2026-09-12 布局修复

- Markdown 文件：列表标记实时着色并增加悬挂缩进；H1–H4 使用分级配色。
- 对话回复：移除短内容的自动居中，统一从内容栏左侧开始。
- 对话表格：取消负边距和强制块级表格，恢复表格语义、正常列宽、换行与滚动。
- 修复前备份：`backups/codex-theme_20260912_before-layout-fix.mjs`。
- 验证证据：`tmp/layout-verification.json`、`tmp/codex-theme-layout-after.png`、`tmp/codex-theme-headings-list-after.png`。

## 2026-09-12 列表与引用修复

- 对话引用块：关闭 Codex 原生 `::after` 装饰，只保留一条蓝色左边框。
- Markdown 无序列表：把源码标记实时显示为圆点。
- Markdown 有序列表：按序号字符数分配宽度，避免两位数序号换行。
- 加粗强调：使用与 H1 一致的红色 `rgb(231,77,71)`。
- 修复前备份：`backups/codex-theme_20260912_before-list-marker-fix.mjs`。
- 验证证据：`tmp/quotes-lists-after-navigation.json`、`tmp/codex-theme-quote-single-border.png`、`tmp/codex-theme-list-markers-final.png`。

## 2026-09-12 标题色与引用线宽修复

- H1–H6 已替换为用户指定的 `rgb(231,77,71)`、`rgb(215,148,64)`、`rgb(7,170,246)`、`rgb(163,110,251)`、`rgb(109,215,215)`、`rgb(175,191,5)`。
- 聊天引用和 Markdown 引用左边框由 3px 改为 1.5px；同时保留对话中单边框修复。
- 修复前备份：`backups/codex-theme_20260912_before-heading-border-tweak.mjs`。
- 验证截图：`tmp/codex-theme-heading-border-final.png`。
