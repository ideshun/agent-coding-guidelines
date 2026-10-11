# 来源、取舍与证据边界

本项目原创编写轻量原生编码技能与维护评测工具，借鉴下列公开项目的思想。它不是 Karpathy、Multica、Superpowers 或任何编辑器的官方产品，也不代表上游认可这些组合。下文保留实际 diff、快照与证据限制；研究如何落实到运行时见 [设计与覆盖](design.md)，当前正文以根 [SKILL.md](../SKILL.md) 与 [references/](../references/) 为准；规则与探针对应见 [rule-probe-map.md](rule-probe-map.md)。

研究记录日期：2026-10-11。PR 状态和滚动文档会变化；下列 commit 是本次阅读的快照，后续更新应重新检查实际 diff、讨论及许可。

## Karpathy 主分支

研究快照：[2c606141936f1eeef17fa3043a72095b4765b9c2](https://github.com/multica-ai/andrej-karpathy-skills/tree/2c606141936f1eeef17fa3043a72095b4765b9c2)。本次读取的完整归档有 9 个文件，包含四原则、Cursor 规则、Claude 插件元数据和教学示例；不含根 AGENTS.md、hooks、scripts、tests、benchmark 或独立 LICENSE 文件。

采用四项核心思想，重新组织为一份按需加载的原生技能正文：

- Think Before Coding：先读相关代码和文档，处理影响正确性的未知信息，不把推断当事实。
- Simplicity First：优先已有能力，避免推测性功能、依赖和抽象。
- Surgical Changes：每项修改服务当前需求，保护已有风格和用户改动。
- Goal-Driven Execution：先定义可观察的成功条件，以实际检查结果报告完成情况。

上游 [SKILL.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/skills/karpathy-guidelines/SKILL.md) 为 2,518 字节，SHA-256 为 `6e22cc54cb02a5e98ae42d06d9d7292db0c1b43894831b32879beb0166b2aea7`。字节量只用于快照识别，不等于某个模型的 token 成本。

上游 EXAMPLES 是教学材料，不是测量数据。例如同分排序示例只断言 score，不能证明 tie ordering；不得据此宣称实测性能或正确性收益。

## 七个指定 PR 的实际审查

七个 PR 在本次研究时均为 **Open、未合并**。重新读取七个公开 `.diff`（#188、#186、#208、#197、#187、#177、#206 分别为 258、3833、5192、234、35、70、65 行）并核对各自公开 Conversation 页面；这不是按标题推断价值。公开页面均显示无 reviews；187 有一条简短支持评论，其他已读页面没有实质性的独立评审讨论。部分 GitHub 按需评论加载失败，匿名 API 限流，因此“未见评审”不保证不存在所有 inline comments。

| PR 与阅读快照 | 实际 diff | 采用 | 不采用及证据限制 |
| --- | --- | --- | --- |
| [188](https://github.com/multica-ai/andrej-karpathy-skills/pull/188/files) · `b35f899208b489c4f0de238d17f5b3ac03f592eb` | 修改 Cursor rule、CLAUDE.md、SKILL.md 与 README；增加复杂度校准表、过度设计征兆、diff 自查和验证循环。 | 简单任务少流程；按影响校准；检查修改边界；无证据不声称完成。 | 不要求所有 feature 都先运行失败测试，不要求逐字输出可能含敏感信息的失败日志。没有 benchmark 或测试结果文件。 |
| [186](https://github.com/multica-ai/andrej-karpathy-skills/pull/186/files) · `7f0e3953724db00729d0774639dc2a052de95635` | 32 文件；最终 SKILL 改为按需 guardrails；增加 Python、PowerShell、VS Code benchmark runner、原始结果与 demo tasks。 | 缺什么加载什么；不重复已有约束；读取失败不盲改；复用验证工具；质量与完整成本同时比较。 | 不照搬三行报告上限、固定一次替代读取、禁止临时文件、未经官方证明的通用 JSON 配置。旧 runner 探查作者机器上的凭据文件，不适合本项目。测量范围见下节。 |
| [208](https://github.com/multica-ai/andrej-karpathy-skills/pull/208) · `c0f10f7d9ae4b3189b51aeb13a9f569c60227eac` | 标题为 `Docs/collapse four principles`；实际删除原 Cursor/Claude 入口与旧 SKILL，新增 karpathy-jev、decision registry、router、证据采集、UserPromptSubmit/PreToolUse/Stop hooks 和评测。 | 观察退出码与真实输出；最后修改后验证；缺证据不得记为 pass；区分“获准继续”与“代码正确”。 | 不安装外部裁决、hooks 或 router。其客户端需要 TypeSafe API key，向外部发送请求、消息、diff 与命令证据；PreToolUse 改写命令，Stop 可强制返工。增加的数据流和流程超出本项目默认边界。 |
| [197](https://github.com/multica-ai/andrej-karpathy-skills/pull/197/files) · `6ea4bdfb63233cf85224525dc9d364f19d9f9c2b` | 新增 202 行 IN-PRACTICE.md 及中英文 README 链接；记录误判 typecheck、审计覆盖不足、先复现及无关死代码整改案例。没有新增 hook 实现。 | 如实说明已查和未查；检查退出码之外的输出；有条件时证明测试能抓住缺陷；无关清理另立任务。 | 不把所有 bug 强制新增测试、所有修改强制 hook 或额外 worktree。它是经验记录，没有对照 benchmark。 |
| [187](https://github.com/multica-ai/andrej-karpathy-skills/pull/187.diff) · `c9a98dd2c5971055253696ed94db109bb2e2cde2` | 仅 README 增加 24 行，讨论统一规则跨工具复用。所谓 multi-agent 指跨工具共享，不是并发调度实现。 | 单一来源、薄工具适配层；避免长期独立维护同义副本。 | 不把 CURSOR.md 当已经确认的原生配置机制，不宣称该 PR 提供多代理调度、自动去重或实测收益。公开讨论仅一条简短支持评论。 |
| [177](https://github.com/multica-ai/andrej-karpathy-skills/pull/177/files) · `254ae8e6483b26e2ae941c55f64f2d43ce2c8919` | 五个规则文件各增加 3 行，共 15 行；强调原生能力、避免不必要依赖、直白实现及 shortcut TODO。 | 优先平台与现有依赖；保持代码直白；不为了偏好改变已有架构。 | 不要求每次修改都添加 TODO；这会制造无关注释和未兑现承诺。没有对照测试或 benchmark。 |
| [206](https://github.com/multica-ai/andrej-karpathy-skills/pull/206/files) · `135763906f9ba9277732dbab2b5d7d271d6778f1` | 新增 18 行 explain-agent-output SKILL，并注册插件、修改两份 README；四文件 +27/-1，四原则不变。 | 报告先给结果，分清事实、解释与验证证据。 | 不增加第二个解释 skill，不强制 ASD-STE100、HTML 或视频输出；输出格式不等于执行证据。没有效果评测。 |

这些提案可作为候选设计资料，不能称为已合并规则或上游推荐方案。采用的是明确列出的思想，不是整套提案。

## 中文兼容的六个补充 PR


2026-10-11 取得以下六个 PR 的完整公开 diff，重点核对技能入口、description、元数据、规则及 hooks，并查阅可访问的讨论页面；不是全量 PR 审查。匿名接口限流、部分评论按需加载失败，不能据此声称没有其他方案或所有评论都已读。原生格式依据为 [Agent Skills 规范](https://agentskills.io/specification)，宿主行为仍以各自官方说明为准。

| PR / 页面所示状态 | 实际变更及判断 | 本项目取舍 |
| --- | --- | --- |
| [#89：中文翻译](https://github.com/multica-ai/andrej-karpathy-skills/pull/89/files) · Open | 新增 CLAUDE、EXAMPLES、README 及技能的 zh-CN 译本；中文 description 位于 `skills/karpathy-guidelines/SKILL.zh-CN.md`，原 `SKILL.md` 未改。标准入口名称是 `SKILL.md`，因此该 diff 不能证明原生中文选择已生效。 | 借鉴中文任务描述和术语可读性；使用一个标准入口，不依赖宿主自动识别本地化文件名，不复制其所有强制提问和固定测试示例。 |
| [#104：Codex 元数据](https://github.com/multica-ai/andrej-karpathy-skills/pull/104/files) · Open | 扩充英文 description，新增 `agents/openai.yaml`，显式设置 `allow_implicit_invocation: true`；README 增加 Codex 安装说明。没有中文触发对照。 | 采用准确描述及原生隐式选择；Codex 元数据按宿主需要生成，不当作跨工具通用字段；安装路径按当前官方文档核验。 |
| [#141：冲突与建议](https://github.com/multica-ai/andrej-karpathy-skills/pull/141/files) · Open | 增加识别与既有代码/需求的矛盾、结合上下文推荐方案；同时扩大为 ANY coding task，并加入固定选项格式。 | 采用实质性矛盾识别和简短建议；正常需求修正可直接跟进，不强制每次罗列选项或所有模糊表达都暂停。 |
| [#168：简单方案的边界](https://github.com/multica-ai/andrej-karpathy-skills/pull/168/files) · Open | 强调可维护性及安全不能为少写代码让路；发现坏风格要求先询问。 | 保留必要正确性、安全与维护约束；不把每次遇到风格偏好都变成审批或扩大为无关整改。 |
| [#183：无测试与诚实报告](https://github.com/multica-ai/andrej-karpathy-skills/pull/183) · Closed，未合并 | 只修改 `CLAUDE.md`，补充无测试框架时的可用检查和如实报告；并要求失败展示原始输出。 | 吸收有意义的现成验证及真实状态；按相关性摘要失败证据，不强制输出完整日志。静态检查仍不能代表运行正确。 |
| [#103：拆分技能与 hooks](https://github.com/multica-ai/andrej-karpathy-skills/pull/103/files) · Open | 拆分四个 skill，增加 Claude 的提示/编辑 hooks；`hooks/vague-verb-check.py` 仅以英文动词正则匹配并注入提醒，没有判断任务对象或需求是否完整。 | 借鉴区分适用/不适用任务的意识；不拆成四个通用入口，也不引入此 hook。根据代码判断，该匹配会漏掉纯中文表达，并可能给已明确的英文任务增加提醒；本次未对该方案做模型收益测量。 |

这些 PR 是设计资料，没有证明本项目中文准确率或成本优于原版。#183 的关闭不代表被采纳；其他页面显示 Open 也不代表上游认可。实际 diff 的取舍按本项目目标重新编写，不整套安装。

## PR 186：减少输出不一定减少总成本

已读取 runner 和原始结果，独立核算公开 JSON 的样本数与均值：

| 实验 | 样本 | 可见 input + output tokens 均值 | Pass | 能说明什么 |
| --- | --- | --- | --- | --- |
| 完整 skill 每题加载 | 三题 × 五次 × 两臂，30 calls | baseline 190.13；skill 577.20，约 +203.6% | 10/15 → 15/15 | 这些提示题上质量更高，但可见总成本增加。 |
| adaptive-v2 | 三题 × 五次 × 两臂，30 calls | baseline 206.20；adaptive 113.27，约 −45.1% | 10/15 → 15/15 | 特定路由提示的微测结果；不能直接推广为完整 agent 收益。 |
| 旧 Gemini | 三题、每题每臂一次 | 可见总量约 +59.2%；provider total 约 +21.2% | 0/3 → 3/3 | completion 减少不等于总成本减少；样本与评分方法很弱。 |

[`extension.js`](https://github.com/sumonrh/karpathy-skills-for-antigravity-and-codex/blob/7f0e3953724db00729d0774639dc2a052de95635/benchmark/vscode-lm-runner/extension.js) 预先知道每道题的标签：只有模糊需求加一句“问一个问题并停止”，另两题两臂使用完全相同的 prompt。它没有测量 agent 自动选择规则、读文件、修改代码和运行工具的全过程。评分主要是关键词、结构和行数；visible tokens 不包含隐藏思考或完整账单。

[最终报告](https://github.com/sumonrh/karpathy-skills-for-antigravity-and-codex/blob/7f0e3953724db00729d0774639dc2a052de95635/benchmark/README.md) 已说明这些边界。不能引用早期 PR 描述中的 completion 节省比例作为本项目整体省 token 的证据。

## PR 208：有更多观测，不等于已证明更好

[`jev_client.py`](https://github.com/reliable-era/andrej-karpathy-skills-jev/blob/c0f10f7d9ae4b3189b51aeb13a9f569c60227eac/skills/karpathy-jev/scripts/jev_client.py) 会向外部服务 POST state。模式识别脱敏不能保证移除所有私人信息；本项目不引入这条数据流，也不读取会话历史建立裁决日志。

[`eval/EVALUATION.md`](https://github.com/reliable-era/andrej-karpathy-skills-jev/blob/c0f10f7d9ae4b3189b51aeb13a9f569c60227eac/eval/EVALUATION.md) 承认历史 20 题、每条件一次的试验未建立可靠成功增益；部分条件时间和估算成本提高。当前代码没有新完整成绩，历史 source snapshot、人工标签及严格验证审计不齐，完整数据引用仓库外的 eval_min。离线 router 测试验证程序逻辑，不能证明 coding 成功率提高。

借鉴它的证据分界和管道退出码意识即可；不需要把外部判定器作为轻量工作流的前置依赖。

## Superpowers：采用设计思考，保留流程选择权

来源：[obra/superpowers](https://github.com/obra/superpowers)，特别是 [brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)。

采用：先探索相关上下文；只询问环境无法回答、且影响方案的重要问题；明确 Goal、Non-goal、Anti-goal、Constraints、成功与失败条件；比较真正不同的方案；重大设计在实施前确认；必要时低成本原型验证。

不采用：所有任务强制 brainstorm、固定多轮询问、强制设计文档、强制子代理审核、强制 writing-plans、自动提交或对小改动设置审批仪式。设计资料留在维护文档，默认不注册独立 brainstorming 技能；正文仅处理影响结果的未知信息，Plan 使用工具原生机制。

## 许可与归属

- 本项目采用 MIT，技能正文与维护评测工具以原创表达为主。
- Karpathy 上游 README、plugin.json 和 SKILL frontmatter 声明 MIT，但研究快照没有独立 LICENSE。不能把 PR 208 fork 新增的版权文件冒充 upstream 原有文件。后续若复制实质性正文或代码，应核实并保留相应版权与许可通知；无法核实时不复制。
- Superpowers 的 [LICENSE](https://github.com/obra/superpowers/blob/main/LICENSE) 为 MIT，版权通知为 2025 Jesse Vincent；保留适用的第三方通知。
- 来源链接表示研究与归属，不表示认证、合作或背书。未使用上游 logo，不把本项目测试冒充上游 benchmark。

工具配置机制的官方资料与版本边界见 [compatibility.md](compatibility.md)；本项目验证定义见 [verification.md](verification.md)。
