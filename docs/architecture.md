# 架构说明

## 四层职责

| 层 | Skill | 回答的问题 | 加载策略 |
|----|-------|-----------|---------|
| L1 | global-coding-principles | 怎么工作（纪律） | 全局常驻（always-apply / 全局指令文件） |
| L2 | brainstorming | 做什么、不能怎样 | 按需：关键歧义或重大设计决策 |
| L3 | plan | 怎么实现、怎么验证 | 按需：多步或高风险任务 |
| L4 | verification | 怎么证明做完了 | 按风险分级；代码任务后触发 |
| 专项 | stack-conventions | 怎么遵循项目既有约定 | 按需：进入真实代码库工作时 |

L2/L3 严格分离：brainstorming 不定实现，plan 不重谈需求。L4 不新增第二套验证分级，项目已有分级时沿用。

## 技术栈无关

所有 skill 不绑定任何具体语言、框架或工具链。专项层（stack-conventions）只做**约定检测与遵循**：从项目自身的 manifest、lockfile、相邻代码中发现栈与惯例，而非预设答案。某个生态确需专属细则时，可在 `skills/` 下新增独立的作用域 skill，由 globs/description 限定触发——不进本套件的公共层。

## 单一规范来源

`skills/*/SKILL.md` 是唯一内容源。`adapters/` 下各平台文件只做作用域配置与同步，不维护独立内容副本。同步方式见 README。

## Token 策略

目标不是「文件最短」，而是「无关上下文不注入」：

- 常驻仅 L1（约 90 行），其余按需。
- Claude Code / Codex 靠 skill description 的相关性触发，L2/L3/L4 与专项层不进全局指令。
- 专项层只在真实代码库上下文中加载，避免向无关任务注入任何栈假设。
- 不为了省 token 删掉安全与诚实性约束（红旗表、证据规则保留）。
