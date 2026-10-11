# 规则 → 探针清单（探索性）

本文件记录当前正文规则与八类公开 fixture 的对应关系，用于删减无增益规则。标注为**探索性**：未调用模型，未跑 `none` / `new` 对照矩阵，不作统计结论。离线 oracle（`node --test tests/benchmark.test.mjs`）只证明探针本身可执行。

对照设计（待真实运行时使用）：`none` = 无附加本技能；`new` = 根 [SKILL.md](../SKILL.md) + 按需 `references/`。每组 1–2 次重复即可探测；完整三组九次矩阵暂缓。

## 保留规则与探针

| 规则（当前正文） | 位置 | 探针 fixture | 探针意图 |
| --- | --- | --- | --- |
| T0 直接做、不读 references | SKILL 路由表 | `01-style` | 小改动无澄清/计划仪式；可选浏览器检查不阻止完成 |
| 先读证据、不猜未读实现 | SKILL Core §1 | `03-typescript`, `07-ambiguity` | 读源码/已知事实后再动；不可读时不编造 |
| 最简充分、无推测抽象 | SKILL Core §2 | `02-react`, `08-narrow-scope` | 不加无关能力或包装 |
| 外科手术式改动、保护用户 diff | SKILL Core §3 | `08-narrow-scope` | 仅允许名单内文件变化 |
| 可观察成功、诚实验证 | SKILL Core §4 + verify | `04-bug`, `05-cross-file` | 真实 oracle；失败如实 |
| 修 bug 先复现失败 | verify Rules | `04-bug` | 错误起点失败、参考修复通过 |
| 跨模块验证联动 | verify V2 | `05-cross-file` | 边界金额与提示一致 |
| 关键目标缺失先澄清 | clarify + Ask 清单 | `07-ambiguity` | 先确认指标，无证据不改代码 |
| 重大设计产出 brief | clarify Brief | `06-design` | goal/非目标/约束/取舍；本阶段不写代码 |
| 不可逆须确认 | SKILL T2+confirm | （尚无专用 fixture） | 依赖 Ask 清单；后续可补探针 |
| 提问预算一轮 | SKILL Ask | `07-ambiguity` | 只问影响方案的关键项 |

## 已删减（相对旧多 skill / 旧压缩稿）

| 已删内容 | 理由 |
| --- | --- |
| 独立 `stack-conventions` skill | 与 Core §2/§3 重复；无独立探针；栈细节由项目代码与 `profiles/` 承担 |
| 独立 `plan` skill 与第二套规划流程 | Plan 细节改按需 reference，并复用宿主原生 Plan |
| 独立 L0–L3 验证分级（与用户项目 L1/L2/L3 撞车） | 改为与 T 路由对齐的 V0–V2，且允许项目方案覆盖 |
| 长篇过度设计气味清单 / 红旗表 | 压缩为一条 stop signals；无独立探针覆盖逐条气味 |
| `Default to Chinese` | 个人偏好，无通用探针；改为跟随用户语言 |
| 强制设计文档 / 多轮问答 / subagent review | Superpowers 流程；与 `01-style`、`07-ambiguity` 边界冲突 |
| 「匹配项目风格」的重复表述 | 并入 Surgical；基线模型通常已做 |

## 覆盖缺口（已知）

- 不可逆操作确认：无 fixture。
- 新增依赖须确认：无 fixture。
- 读取失败后的调查路径：无专用失败注入 fixture。
- `02-react` / `03-typescript` 的自动化检查仍为 `pending`（依赖未装）；不据此宣称行为收益。

有真实 `none`/`new` 运行记录后，更新本表「探测结果」列；基线已稳定做到的规则可再删，无探针且无计划补探针的规则应删除。
