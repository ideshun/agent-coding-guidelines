# 研究如何落实到技能

目标是把 Karpathy 四原则做成更可靠、跨工具的行为约束。运行时正文唯一来源是 `skills/*/SKILL.md`（四层 + stack-conventions 专项）；只有重要设计才读取 brainstorming skill。研究、兼容资料留在 `docs/` 供维护和验收，不由日常任务默认读取。兼容覆盖国内外工具，优先原生加载；通用原则只有一个来源，避免重复入口与无必要的额外内容。

## 四层职责与加载边界

| 层 | 入口与作用域 | 承担内容 | 不承担 |
| --- | --- | --- | --- |
| L1 全局纪律 | [global-coding-principles](../skills/global-coding-principles/SKILL.md)，常驻（always-apply / 全局指令文件） | 先读证据、简单充分、局部修改、工具纪律、可观察完成条件 | 个人 React 栈、固定测试命令、强制设计文档 |
| L2 澄清 | [brainstorming](../skills/brainstorming/SKILL.md)，仅关键歧义、重大设计决策或广泛行为变化时加载 | goal、non-goal、anti-goal、constraints、可见成功、真正方案取舍 | 简单任务的问答仪式、强制多轮提问或自动审批 |
| L3 计划 | [plan](../skills/plan/SKILL.md)，多步或高风险任务时加载；宿主已有原生 Plan 时不新建 | 实施范围、依赖、步骤、风险、验证方法 | 再次决定用户要什么、固定每次规划 |
| L4 验证 | [verification](../skills/verification/SKILL.md)，按风险分级；代码任务后触发 | 按风险选检查，核实输出与退出码，报告未验证部分 | 第二套验证分级、虚构通过或机械全量测试 |
| 专项 | [stack-conventions](../skills/stack-conventions/SKILL.md)，进入真实代码库工作时加载 | 约定检测与遵循，不预设栈 | 个人框架偏好、覆盖项目既有风格 |

从用户/项目/目录到具体任务的优先级应由各宿主原生机制解释；技能不能覆盖权限、安全策略或项目专属事实。通用原则只指导决策，不通过强制 `AGENTS.md` 或常驻规则叠加到已有原生技能上。多 Agent 同时工作时使用同一源包；每个 Agent 仍须遵守自己可见的项目指令和实际检查结果，不假定另一 Agent 的验证覆盖当前版本。

## 可选项目规范

[React + TypeScript 源规范](../profiles/react-typescript.md) 不在任何全局 skill 中，是 [stack-conventions](../skills/stack-conventions/SKILL.md) 的具体落地示例之一：项目确认采用该栈后，选择目标 IDE 的项目规则入口；[只读转换器](../scripts/export-profile.mjs) 可输出 Cursor `.cursor/rules/react-typescript.mdc`、VS Code `.github/instructions/react-typescript.instructions.md` 或无元数据正文。Cursor 自动附加到项目 `*.ts`/`*.tsx`，VS Code 自动附加到 `*.tsx`；其他工具必须核实实际支持的项目或文件作用域。Ant Design、Umi、AG-Grid、React Flow 只在项目确实使用时适用，不能由个人偏好覆盖项目代码风格。

`skills/` 是唯一正文来源；仓库顶层 `scripts/` 负责维护与只读转换，不在安装包中，不依赖 Node.js 才能使用技能。`docs/` 是维护资料，不属于技能正文；不会被普通编码任务自动读取。规则型宿主由导出脚本去掉 frontmatter、把参考链接折叠为自包含的简短条件提示，避免失效路径与常驻大篇幅设计说明。

## 来源 → 行为 → 验收

| 研究来源 | 采用的决策 | 当前落实位置 | 验收场景 |
| --- | --- | --- | --- |
| Karpathy 四原则 | 先读证据、简单充分、局部修改、定义并验证成功 | [global-coding-principles](../skills/global-coding-principles/SKILL.md) 四个原则 | 每次编码任务 |
| PR 188 | 工作量、规划及检查与复杂度和风险相称 | L1 严格度校准表；L3 只在多步/高风险时启用 | 样式小改动不增加设计仪式；跨文件改动验证联动 |
| PR 186 | 复用上下文中的同义约束；范围化搜索；读取失败先调查 | L1 原则 1 与 L4 diff 自查 | 已知事实不反复询问；文件不可读时不猜实现 |
| PR 208 | 最终版本上的真实输出和退出码；获准执行不等于验证通过 | [verification](../skills/verification/SKILL.md) 诚实报告 | 检查失败/未执行时如实报告；不削弱断言 |
| PR 197 | 审查覆盖范围准确，不能由局部检查声称全量安全；保留既有用户改动 | L1 原则 3 与 L4 | 配置审计给出证据和实际范围；既有失败不引发无关整改 |
| PR 187 | 单一规范来源，入口按各宿主原生机制选择 | `skills/` 唯一来源 + [README 安装说明](../README.md) | 一份公共入口；不叠加专属常驻副本 |
| PR 177 | 复用既有能力和原生功能，避免无价值依赖 | L1 原则 2 与 [stack-conventions](../skills/stack-conventions/SKILL.md) | 无关升级与推测性抽象不进入 diff |
| PR 206 | 报告结果、验证和不确定性，避免固定展示流程 | [verification](../skills/verification/SKILL.md) | 简洁真实的交付，不强制第二个解释技能 |
| PR 89 / 104 | 标准入口和简短 description，使用宿主原生选择 | 各 skill frontmatter 和原生安装 | 发现、隐式选择、行为三层分别观测 |
| PR 141 | 识别实质性矛盾，先依据上下文解决，必要时简短推荐 | L1 原则 1 | 同步返回与 Promise 的矛盾；正常需求修正直接跟进 |
| PR 168 | 简单方案保留必要正确性、安全和可维护性 | L1 原则 2 | 少代码不能成为删保护或改架构的理由 |
| PR 183 | 使用现成可用的验证方式；未执行不伪报 | [verification](../skills/verification/SKILL.md) | 无测试框架时不强装新框架或声称测试通过 |
| Superpowers Brainstorming | 重大设计明确目标、非目标、约束、不可接受结果与取舍；原型只解决关键未知 | [brainstorming](../skills/brainstorming/SKILL.md)；其强制多轮讨论、强制设计文档、TDD、subagent review、自动提交**不采纳** | 草稿持久化设计；与已有服务及用户隔离一致 |

以上是设计可追溯性，不是模型收益成绩。实际 diff、阅读快照、未采用内容与证据限制见 [研究记录](references.md)。

## 跨场景决策

| 情况 | 所需工作 | 应避免 |
| --- | --- | --- |
| 明确的局部修改 | 读相关实现，局部改动，最小充分检查 | 重新澄清已知需求、全量 brainstorm、无关整理 |
| 关键目标缺失 | 先读事实，问会改变方案的关键问题 | 为方便执行而自选指标或瓶颈 |
| 重要设计选择 | 明确目标/非目标/约束/不可接受结果，比较真正不同的取舍 | 每个任务固定设计文档、重复确认已定方案 |
| 复杂实施或难恢复的变更 | 使用 plan skill 或宿主原生 Plan，识别依赖、风险、验证与恢复 | 第二套通用 planning 技能或无关审批 |
| 检查、解释、审查 | 依据证据报告范围；获准修改才动文件 | 把「这些有用吗」理解成批量移除的授权 |
| 检查失败或环境受阻 | 调查实际输出，保持任务范围，说明未验证部分 | 吞错误、弱化检查、顺便修所有既有问题 |

## 中文兼容

兼容包含语义选择、意图边界、输出语言三件事。skill description 提供任务线索；正文保留否定、范围、顺序、上下文指代和明确修正，不增加中文副本或英文动词正则 hook。语言和描述形式的收益需要对照，不能假定英文更省或中文文字越多越准。

## 不放入通用技能的内容

个人框架、包管理器、注释风格、具体验证命令属于用户或项目规范——由 [stack-conventions](../skills/stack-conventions/SKILL.md) 检测遵循，或由 [profiles/](../profiles/) 下的可选项目规范显式声明。原生权限和适用项目指令保持宿主优先级；技能复用已有约束，不能重定义它们。已批准的实施不泛化为安装额外应用、hooks、MCP、自动提交、外部裁决或第三方数据流的授权。

## 成本与加载

常驻仅 L1；L2/L3/L4 与专项按需加载。原生技能部署 `skills/<name>/SKILL.md`；规则型宿主部署同一正文的自包含导出形式。技能正文没有引用研究或评测文件，兼容资料只在安装或维护时使用。原生发现时的描述成本、选中后的正文成本、工具调用和输出成本分别记录。按需选择与去重是设计选择；在实际测量前，不把字节量、删文件或输出更短写成 token 节省结论。
