# 架构说明

## 四层职责

| 层 | Skill | 回答的问题 | 加载策略 |
|----|-------|-----------|---------|
| L1 | global-coding-principles | 怎么工作（纪律） | 全局常驻（always-apply / 全局指令文件） |
| L2 | brainstorming | 做什么、不能怎样 | 按需：关键歧义或重大设计决策 |
| L3 | plan | 怎么实现、怎么验证 | 按需：多步或高风险任务 |
| L4 | verification | 怎么证明做完了 | 按风险分级；代码任务后触发 |
| 专项 | react-typescript | 该技术栈怎么写 | 按文件/项目作用域（globs/description） |

L2/L3 严格分离：brainstorming 不定实现，plan 不重谈需求。L4 不新增第二套验证分级，项目已有分级时沿用。

## 单一规范来源

`skills/*/SKILL.md` 是唯一内容源。`adapters/` 下各平台文件只做作用域配置与同步，不维护独立内容副本。同步方式见 README。

## Token 策略

目标不是「文件最短」，而是「无关上下文不注入」：

- 常驻仅 L1（约 90 行），其余按需。
- Cursor 用 `globs` 把 react-typescript 限定在 TS/TSX 文件上下文。
- Claude Code / Codex 靠 skill description 的相关性触发，L2/L3/L4 不进全局指令。
- 不为了省 token 删掉安全与诚实性约束（红旗表、证据规则保留）。
