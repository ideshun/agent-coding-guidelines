# Benchmark 与验证边界

这套框架提供八类公开任务、可执行的行为 oracle、人工审查标准与本地结果记录格式。它不会调用模型、启动 MCP、读取配置/认证/历史/用户环境变量，也不会安装依赖或上传结果。

离线检查只能说明框架与部分 oracle 可用，不能证明规则改善了完成率、质量、tokens 或执行时间。本公开仓库没有可发布的真实模型对照结果；历史本机试用不证明当前版本效果。

## 八类任务

每个 `benchmarks/fixtures/<id>/task.json` 明确记录任务输入、需先读的上下文、期望产物、通过标准、允许修改的文件和关键确认边界。任务元数据供执行器与审查者使用，不应整份再注入为额外全局规则。

| ID | 任务 | 通过标准 | 首轮状态 |
|---|---|---|---|
| `01-style` | 小范围按钮样式 | 精确 CSS 声明值，保留其余声明；浏览器检查仅为可选项 | 声明 oracle 的错误起点失败、参考修复通过；可选浏览器检查未执行，不阻止轻量任务完成 |
| `02-react` | React 计数器 | 初始 0、连续 +1、重置、再次增加；严格类型检查 | pending，未安装 fixture 的编译与交互测试依赖 |
| `03-typescript` | 返回值类型错误 | 编译成功；空、负数、小数输入保留数值求和语义 | pending，未安装 TypeScript 编译依赖 |
| `04-bug` | 排序 bug | 分数降序、同分姓名升序、输入不变与边界输入 | 错误起点失败、参考修复通过；遗漏同分排序也确实失败 |
| `05-cross-file` | 免运费边界 | 99、100、101 的金额、运费与提示一致 | 错误起点失败、参考修复通过 |
| `06-design` | 草稿持久化设计 | 与已有服务、用户隔离及范围一致；比较取舍与失败场景 | 人工/受控模型审查 pending，没有关键词评分 |
| `07-ambiguity` | “搜索更快” | 先读现状，再确认速度指标；无证据不猜瓶颈，不先改代码 | 对话和行为审查 pending，没有模型调用 |
| `08-narrow-scope` | 只改货币前缀 | 真正的格式化结果正确，其他文件与无关代码不变 | 行为 oracle 与参考修复边界通过；实际 Agent diff 审查 pending |

CSS 声明检查不是浏览器视觉测试。普通颜色改动不默认进入运行时/浏览器验证；task.json 的 `optionalChecks` 仅在用户要求或实际渲染/布局疑问时运行，未执行不阻止完成。检查文件或规则格式不是原生工具加载测试。真实交互、模型行为、架构质量与修改必要性不能用几个词是否出现来判断。

React fixture 给出真实 Testing Library/Vitest 交互断言；TypeScript fixture 先编译业务源码再运行数值断言。两者的 `package.json` 只是可选复现依赖声明，不代表本轮安装或执行过这些依赖。需要使用时，在执行副本中明确安装并记录版本与 lockfile；不要在原 fixture 上安装，也不要由框架自动安装。

## 公平对照

三组为 `none`（没有附加本项目或历史规则的基线）、`legacy`（执行前规则的固定快照）、`new`（本项目规则）。各组保留相同原生平台基础行为；`new` 以根 SKILL.md 为入口，按各自触发条件读取 `references/`。规则型宿主需记录使用轻量还是完整导出，不能混用为同一规则组；规则内容及原生选择方式是实验变量。

规则删减先用探索性对照（见 [rule-probe-map.md](rule-probe-map.md)）：`none` 与 `new` 各组 1–2 次重复即可探测，不作统计结论。完整三组、每组至少三个独立重复、八任务矩阵（≥72 次）暂缓，待有真实运行记录后再做；三次只是将来的最低复现门槛，不构成统计显著性证明。

比较前必须固定：

1. 相同原始 fixture 指纹、任务提示、上下文、oracle 和人工 rubric。每次从原始 fixture 建立新副本，保护检查文件不被模型更改；检验模型交付时使用可信的原始 oracle。
2. 相同模型 ID/版本、原生工具接口/版本/能力、执行预算与测量方法。无可观测版本时明确为 `null`，只在相同实际配置下做有限解释，避免跨日期自动升级混入实验。
3. 相同可控的环境指纹与原生平台基础条件。各组规则指纹不同；同一组重复必须使用相同规则指纹。
4. 明确隔离全局指令、Skills、插件与 hooks。原生工具若继续加载既有全局配置、TeamAI 或其他 hooks，或者没有证据能控制其加载，本次对照不可认为公平。
5. 先判完成与质量，再比较资源消耗。减少 tokens 但违反需求、修改边界或验证要求，不能算改善。

全局隔离必须经过原生机制确认；换一个工作目录、创建一份 AGENTS.md、改变进程参数或静态检测成功，都不能单独证明隔离成立。框架只检查记录是否完整一致，不证明填写者实际完成了隔离，也不能证明记录真实。

当前版本的模型行为 smoke 为 **pending**；宿主发现证据与模型行为、受控环境分别记录。少量 smoke 将来即使成功，也只证明当次入口和行为，不替代上述三组重复对照。框架不会自动调用 Cursor/Codex CLI 或云模型。

## 本地操作

Node.js 20+，零运行时依赖。以下模板和采集命令不会启动模型：

```sh
node --test tests/benchmark.test.mjs
node benchmarks/collect.mjs --help
node benchmarks/collect.mjs validate benchmarks/examples/offline-oracle.json
```

对单个任务，从原 fixture 建立隔离副本，把 `prompt` 给相同模型，并提供 `contextFiles` 中的真实内容或可读取路径。执行器控制检查文件与变更边界，不让模型重写 oracle 后自称通过。仅任务规则来源在三组间变化；不要加入不同角色提示、额外工具或预算。设计与歧义任务按人工标准评估对话、判断与产物，不能伪装成自动测试结果。

将原生运行记录保存在本地忽略目录；只选定结果 JSON，不扫描任意工作目录：

```sh
mkdir -p benchmarks/.results
node benchmarks/collect.mjs template --task 04-bug --group new --run-id bug-new-1 --repetition 1 > benchmarks/.results/draft.json
# 从真实执行证据填写 draft.json；未观测到的指标保持 null。
node benchmarks/collect.mjs validate benchmarks/.results/draft.json
node benchmarks/collect.mjs record --input benchmarks/.results/draft.json --out benchmarks/.results/bug-new-1.json
```

`record` 只新建一个验证后的 JSON 文件，以独占方式拒绝覆盖已存在的文件。结果输入必须是明确选中的普通 JSON 文件，不超过 1 MiB；敏感配置路径以及指向这些路径的软链接会在读取前拒绝。它不读取认证、历史或环境，错误不会打印完整私人路径。

为同一任务准备好三组各至少三个真实记录后，显式列出文件：

```sh
node benchmarks/collect.mjs compare \
  benchmarks/.results/bug-none-1.json benchmarks/.results/bug-none-2.json benchmarks/.results/bug-none-3.json \
  benchmarks/.results/bug-legacy-1.json benchmarks/.results/bug-legacy-2.json benchmarks/.results/bug-legacy-3.json \
  benchmarks/.results/bug-new-1.json benchmarks/.results/bug-new-2.json benchmarks/.results/bug-new-3.json
```

缺少重复、规则指纹、预算、完成评估、真实模型记录或受控原生环境时，结果为 `blocked`，退出码 1。只有门槛满足才给出描述性汇总；仍需审查执行证据和质量，汇总不会自动宣告新规则更好。

## 结果与测量

数据格式见 `benchmarks/result.schema.json`，任务格式见 `benchmarks/task.schema.json`。采集器的内置校验器只实现仓库实际使用的 Schema 子集；它不是通用 JSON Schema 产品。fixture 指纹包括原始文件内容、提示与 oracle，排除 Finder 的普通 `.DS_Store` 元数据文件；升级 fixture 后应重跑或使用对应旧仓库版本，不能手改指纹让旧数据冒充新数据。

| 字段 | 来源与边界 |
|---|---|
| `completion` | 对照必需通过标准及真实运行，并审查 diff 边界；未知范围保留 `null`，已知无关或禁止文件改动不能计完成；可选检查不阻止完成；离线 oracle 不能声称模型完成任务 |
| `testPass` | 必需自动化检查的实际退出码与断言；没有相应检查或未执行为 `null` |
| `unrelatedDiff` | 实际 diff 中超出允许文件或请求目标的改动行数；需审查，未审查为 `null` |
| `changedFiles` | 执行后相对原 fixture 的真实变更文件，使用相对路径；未知为 `null` |
| `tokens` | 原生报告中的 input/output/total；缺少真实计数就为 `null`，不得用字符数或估算冒充 |
| `toolCalls` / `elapsedMs` | 当次原生运行真实工具调用数与耗时；没有证据为 `null`，不把维护者运行 oracle 的耗时当模型耗时 |
| `userConfirmations` | 当次用户确认次数，按统一边界统计；未观测为 `null` |
| `ruleViolations` | 每个违反点与可检查证据；确实审查且没有违反用空数组，未审查用 `null` |
| `evidence.checks` | 检查 ID、自动/人工、passed/failed/pending、退出码与证据说明；人工评估无退出码 |

同一组某指标存在缺测时，采集器将该指标均值保留 `null`，不把未知当成 0。测试框架中的合成记录只是验证对照门槛与数据逻辑，不是实测。

只有公开 fixture 与去标识的示例可以进入仓库。原始对话、私人规则、账号、接口地址、API key、配置快照、历史日志和机器路径保留在本地，不复制到公开 benchmark。Schema 校验不能识别所有私人信息，发布任何结果前仍需人工去标识审查。框架不自动发布结果。
