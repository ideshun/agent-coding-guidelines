# 跨工具兼容与安装

兼容范围包含国内外 AI 编码工具、IDE 插件、CLI、远程及云端工作区。CodeBuddy、Qoder、Trae 是明确支持的目标。根 [SKILL.md](../SKILL.md) 是唯一通用原则正文；根据当前宿主部署原生 Skill、导入技能或转换成原生规则/自定义指令。日常任务无需手动引用仓库规则。

## 兼容入口与证据

[工具目录](tool-registry.json) 包含 88 个具体宿主配置，另有未列出工具的通用接入流程。每项记录产品、作用域、入口、选择机制、来源与注意事项；这不是本机已安装工具清单。

核对日期：2026-10-11。`vendor-docs` 表示厂商文档已核对；`installer-registry` 表示 [Vercel Skills 安装器源码](https://github.com/vercel-labs/skills/blob/main/src/agents.ts) 声明了入口，实际宿主版本仍需确认。源码抓取的 SHA-256 保留在 JSON，动态 main 链接不当作固定版本证据。目录信息、原生发现、模型表现分别验收。

`~` 是当前执行端的用户目录；`${VAR:-default}` 表示配置根可能随环境变量变化，不能照字面创建目录。Windows 使用实际用户目录及宿主路径规则。远程容器、SSH、云端在实际运行 Agent 的环境解析路径。

## 国内工具及产品差异

下表技能目录均再包含 `agent-coding-guidelines/SKILL.md`、`LICENSE` 和 `references/{clarify,plan,verify}.md`。

| 产品 / 目录 ID | 用户级 | 项目级或原生导入 | 加载与注意事项 | 依据 |
| --- | --- | --- | --- | --- |
| CodeBuddy Code / CLI `codebuddy` | `~/.codebuddy/skills/` | `.codebuddy/skills/` | 描述匹配；检查 `skillOverrides` 和禁用状态，保留其他设置 | [CLI Skills](https://www.codebuddy.cn/docs/cli/skills) |
| CodeBuddy IDE / 插件 `codebuddy-ide` | 用当前 IDE 技能管理/导入确定位置 | `.codebuddy/skills/` | 发现不等于调用；按下文配置开发任务短触发 Rule，不把 CLI 用户目录泛化到 IDE | [IDE Skills](https://www.codebuddy.ai/docs/ide/Features/Skills) |
| Qoder CLI `qoder` | `~/.qoder/skills/` | `.qoder/skills/` | `/skills reload`；CLI 文档规定同名用户技能优先 | [CLI Skills](https://docs.qoder.com/cli/Skills) |
| Qoder CN CLI `qoder-cn` | `${QODERCN_CONFIG_DIR:-~/.qoder-cn}/skills/` | `.qoder/skills/` | 厂商确认配置根，安装器声明 skills 入口；确认当前 CLI 发现结果 | [配置作用域](https://docs.qoder.cn/en/cli/config-scope)、[安装器](https://github.com/vercel-labs/skills/blob/main/src/agents.ts) |
| Qoder IDE `qoder-ide` | Extensions → Skills → Add Skills → Upload Skill | 导入 `SKILL.md` 或 ZIP | 官方提供导入机制，未给磁盘路径；按 Installed 及 `/` 建议验收 | [Skills](https://docs.qoder.com/qoder/skills) |
| Qoder CN IDE `qoder-cn-ide` | 使用 CN 客户端的同名导入入口 | 原生导入 | 不与 CLI、旧 Lingma 路径混用 | [CN Skills](https://docs.qoder.cn/en/qoder/skills) |
| QoderWork / CN `qoderwork` / `qoderwork-cn` | `~/.qoderwork/skills/` | 也支持原生上传；未确认项目级目录 | 描述匹配，可把仓库链接交给它安装 | [QoderWork](https://docs.qoder.com/qoderwork/skills)、[CN](https://docs.qoder.cn/en/qoderwork/user-guide/scalability/skills) |
| TRAE CN IDE `trae-cn` | `~/.trae-cn/skills/` | `.trae/skills/`；或启用项目 `.agents/skills/` 导入开关 | 自动选择；同名 `.trae` 优先于 `.agents`。未确认读取用户 `~/.agents/skills` | [CN Skills](https://docs.trae.cn/ide_skills) |
| TRAE 国际版 IDE `trae` | `~/.trae/skills/` | `.trae/skills/` | 安装器声明入口；国际文档本次未能读取，安装时确认当前客户端 | [安装器](https://github.com/vercel-labs/skills/blob/main/src/agents.ts) |
| Lingma / 旧 Qoder CN IDE `lingma` | `~/.lingma/skills/` | `.lingma/skills/` | 该代文档入口，同名项目优先，不能泛化到新 CLI/IDE | [技能指南](https://docs.qoder.cn/user-guide/skills) |
| Kimi Code CLI `kimi-code-cli` | `~/.agents/skills/` | `.agents/skills/` | 模型选择；同时检查 Kimi 专属根及 `KIMI_CODE_HOME`，避免重名 | [Kimi Skills](https://www.kimi.com/en/help/kimi-code/cli-skills) |
| Qwen Code `qwen-code` | `~/.qwen/skills/` | `.qwen/skills/` | 安装器入口；先核对当前版本功能及启用状态 | [安装器](https://github.com/vercel-labs/skills/blob/main/src/agents.ts) |
| iFlow CLI `iflow-cli` | `~/.iflow/skills/` | `.iflow/skills/` | 文档要求 `SKILL.md`，管理结果可能显示 `skill.toml` 注册；用 `/skills list`、`/skills refresh` 验收 | [iFlow](https://docs.iflow.cn/cli/examples/skill/) |
| CodeArts Agent / MiniMax Code / ZCode | 各自专属根 | 各自项目技能目录 | 安装器声明的独立目标，不根据模型供应商推断加载路径 | [工具目录](tool-registry.json) |
| 百度 Comate / Zulu `comate` | 本次只确认项目规则 | `.comate/rules/*.mdr`，用原生界面创建 | 导入转换正文，保留界面生成的元数据；也读取 Cursor 规则，先查等价内容 | [Comate Rules](https://comate.baidu.com/docs/IDE%E5%8A%9F%E8%83%BD/%E6%99%BA%E8%83%BD%E4%BD%93/%E8%A7%84%E5%88%99/) |

## 其他常用编码工具

| 产品 / 目录 ID | 用户级 | 项目级 | 依据与差异 |
| --- | --- | --- | --- |
| Codex `codex` / Cursor `cursor` | `~/.agents/skills/` | `.agents/skills/` | [Codex](https://learn.chatgpt.com/docs/build-skills)、[Cursor](https://cursor.com/docs/skills)；检查专属及兼容目录，已有共享入口不再复制 |
| Copilot in VS Code `copilot-vscode` | `~/.agents/skills/` | `.agents/skills/` | [VS Code Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)；CLI 是独立目标 |
| Claude Code `claude-code` | `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/` | `.claude/skills/` | [Claude Code](https://code.claude.com/docs/en/skills)；不等于 Desktop 或网页版 |
| Cline `cline` | `~/.cline/skills/` | `.cline/skills/` | [Cline](https://docs.cline.bot/customization/skills)；厂商路径与安装器不同，采用厂商原生目录；同名全局优先 |
| Windsurf / Cascade `windsurf` | `~/.codeium/windsurf/skills/` | `.windsurf/skills/` | [Cascade](https://docs.devin.ai/desktop/cascade/skills)；检查 Devin 兼容入口 |
| Continue / Roo / Kilo | 见各自工具目录 | 见各自工具目录 | [安装器](https://github.com/vercel-labs/skills/blob/main/src/agents.ts) 声明的目标；版本及开关按宿主确认 |
| Gemini CLI / Antigravity / Amp / OpenCode | 见各自工具目录 | 部分共用 `.agents/skills/` | 公共项目目录不意味着公共用户目录；配置根分别确认 |
| Junie / Kiro CLI / Augment / Droid / Goose / Zed / Warp | 见各自工具目录 | 见各自工具目录 | 独立产品入口；Junie 不等于 JetBrains AI Assistant，Kiro CLI 不等于 IDE |
| Amazon Q Developer IDE `amazon-q-ide` | 未确认用户级 | `.amazonq/rules/agent-coding-guidelines.md` | [项目规则](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-project-rules.html)，常驻加载项目聊天上下文 |
| JetBrains AI Assistant `jetbrains-ai` | 本入口使用项目规则 | `.aiassistant/rules/agent-coding-guidelines.md` | [项目规则](https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html)，支持时选择 By model decision 并填入技能描述；默认 Always 成本不同 |
| Aider `aider` | 现有用户配置 `read` 可指向实际绝对路径 | `AGENT_CODING_GUIDELINES.md`，合并至 `.aider.conf.yml` 的 `read` | [配置](https://aider.chat/docs/config/aider_conf.html)；保留其他配置及 `read` 项 |

更多宿主完整列在 [工具目录](tool-registry.json)：AiderDesk、AstrBot、IBM Bob、Codemaker、Code Studio、Command Code、Cortex Code、Crush、Deep Agents、Devin Terminal、Dexto、Eve、Firebender、ForgeCode、fx、Grok Build、Hermes、inference.sh、Jazz、Kimchi、Kode、Loaf、MCPJam、Mistral Vibe、Moxby、Mux、OpenClaw、OpenHands、Ona、Pi、Posit Assistant、Replit、Reasonix、Rovo Dev、Sarvam Code、Tabnine CLI、Terramind、Tinycloud、Zencoder、Zenflow、Neovate、Pochi、PromptScript、AdaL、Autohand Code CLI、Antigravity CLI。

## 三种部署方式

1. **原生 Skills**：只部署运行时文件——`SKILL.md`、`LICENSE` 与 `references/{clarify,plan,verify}.md`（可用 `node scripts/pack-skill.mjs --out <dir>` 生成）；不要复制 `benchmarks/`、`docs/`、`scripts/`、`profiles/`。保留正常自动选择；确认启用状态、发现目录和技能列表。无额外运行时依赖。
2. **原生技能导入**：上传同一目录结构或 ZIP，在客户端完成导入并确认管理列表。若 UI 只接收单个 `SKILL.md`，先检查其是否支持引用文件；不支持时用规则型自包含正文，不能留下失效链接。无法操作 UI 时交付导入文件并报告待导入状态，磁盘暂存不能说成已安装。
3. **规则 / 自定义指令**：默认使用 `scripts/export.mjs --format instructions`，移除 YAML frontmatter，把双语 description 作为适用范围，保留完整根正文，只移除可选文件链接。需要参考细节时选择 `instructions-full`，内联实际参考正文各一次并改为文内链接。两种方式检查引用有效性，均不维护另一份摘要。合并至原生入口或原生 UI 创建的规则正文；完整导出成本不同于原生 Skill 的按需文件读取。支持模型判断或文件作用域时使用相应机制，不同时启用 Skill 与等价规则。

安装 AI 根据当前宿主选择一个入口，用户无需日常手工引用。通用正文不绑定厂商 MCP 名、工具 API、hooks 或固定流程，也不改变宿主权限与实际加载优先级。

## CodeBuddy 自动触发

本节针对 CodeBuddy IDE/插件，CLI 的接口与配置另行核实。[IDE Skills 文档](https://www.codebuddy.ai/docs/ide/Features/Skills)说明名称与描述用于选择，正文在触发后加载。因此，模型看到技能清单仍可能直接使用普通编码工具。安装本技能用于日常开发时，配置一个短原生触发入口，保持 Skill 正文只有一份。

1. 先确认 `agent-coding-guidelines` 已被当前客户端发现、启用且可读取，并核对原生 Skill 工具。下面示例适用于已确认提供 `use_skill`、参数为 `command` 的版本；其他版本按实际接口适配，不能仅据 CLI 文档猜测 IDE 能力。
2. 在安装请求授权的用户级或项目级作用域中，优先把下面的正文合并到已有始终应用的 Rule。若没有合适规则，通过当前客户端原生机制创建；保留其合法元数据。用户规则位置由目标界面或现有有效配置确认，项目规则使用 `.codebuddy/rules/<name>/RULE.mdc`。写入前备份并比较，不覆盖整份自定义规则。

```mdc
---
description: 开发任务自动加载 agent-coding-guidelines
alwaysApply: true
enabled: true
---

软件开发与代码相关任务开始相关工作前，若当前上下文尚未加载 agent-coding-guidelines 正文，必须先调用 use_skill，command 为 agent-coding-guidelines；已加载时不重复调用。普通聊天与非技术写作不触发。
参考文件按任务需要读取。加载失败时如实说明，按宿主现有规则继续，不声称已加载，也不重复无效调用。
```

3. 仅保留一个触发入口，不复制四原则或 `references/` 正文；现有 Plan、验证分级及权限机制继续生效。短触发 Rule 与 Skill 是入口和正文的关系，不是两份等价规范。选择完整规则型部署的宿主无需再配置这个 Skill 触发入口。
4. 按[IDE Rules 文档](https://www.codebuddy.ai/docs/zh/ide/User-guide/Rules)新建会话使规则生效。用未点名技能的开发任务检查实际 `use_skill` 调用和后续行为，不能把模型自报“已使用”当成调用证据。路由提示仍依赖模型执行，不保证每次调用或更低费用；验收状态和缺项应如实报告。

不要为了触发 Skill 添加 MCP、Hook、子代理或重复常驻正文。具体用例见[验证说明](verification.md)。

## 已核对的原生机制边界

- [Cursor Rules](https://cursor.com/docs/rules) 区分项目 `.cursor/rules/*.mdc`、UI 用户规则、文件 glob 和智能体请求；[Skills](https://cursor.com/docs/skills) 确认本机用户 `~/.agents/skills/` 自动发现、正文按相关性选择；[Commands](https://docs.cursor.com/en/agent/chat/commands) 是 `/` 手动调用入口，不适合作为本技能的默认加载方式。[Plan Mode](https://prod.cursor.com/docs/agent/plan-mode) 已提供复杂任务规划，小改动可直接执行。
- [OpenAI Docs：AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) 负责目录层级指令；[Skills](https://learn.chatgpt.com/docs/build-skills) 确认用户级 `~/.agents/skills/`、名字/描述的初始发现与正文按需读取。用户/项目设置用 [config.toml](https://learn.chatgpt.com/docs/config-file/config-basic)，[Sandbox 与审批](https://learn.chatgpt.com/docs/agent-approvals-security) 属于宿主权限层，技能不得覆盖。
- [CodeBuddy IDE Rules](https://www.codebuddy.cn/docs/ide/User-guide/Rules) 将 `alwaysApply` 原文常驻与按描述请求区分；[CodeBuddy Skills](https://www.codebuddy.cn/docs/cli/skills) 有自己的用户/项目入口。[Cline Skills](https://docs.cline.bot/customization/skills) 使用 `~/.cline/skills/`，并有独立启用开关。不能假设它们都读取 Cursor/Codex 的公共用户目录。
- [VS Code 文件指令](https://code.visualstudio.com/docs/agent-customization/custom-instructions) 使用 `.github/instructions/*.instructions.md` 的 `applyTo`；它与 Cursor `.mdc` 不是同一语法。本仓库只输出适配内容，不默认写入任一项目。

已有 Node.js 的维护者可使用以下只读辅助命令。安装 AI 也可直接读取 JSON 并复制或转换正文，Node.js 不是必装依赖：

```sh
node scripts/compatibility.mjs --tool codebuddy
node scripts/compatibility.mjs --list
node scripts/export.mjs --format skill
node scripts/export.mjs --format instructions
```

只输出结果，不扫描应用、不改配置、不联网。`instructions` 不生成宿主元数据：Comate 的 `.mdr` 应先在界面生成，再替换正文，不能用纯 Markdown 覆盖整个文件。更新源技能后重新转换，不维护第二份规范正文。

## 新工具、云端和聊天客户端

CodeGeeX、MarsCode、WorkBuddy、Cody、Tabnine IDE，以及 ChatGPT、Claude 网页、DeepSeek、豆包、腾讯元宝、Kimi 网页、Bolt、Lovable、v0 等，按当前版本核实原生 Skills、项目知识、自定义指令、Agent 系统提示或规则入口，使用同一正文的相应形式。本表没有确认这些产品的磁盘路径，不能据此创建猜测目录。

新工具沿用接入流程，不以白名单限制兼容范围：确认产品/端型/版本 → 核实官方定制机制或真实宿主发现接口 → 选择 Skill/导入/规则 → 安装一份 → 验收。文档不足时从宿主界面或诊断证据确认并记录来源，未确认的路径不得自动写入。

只有会话提示入口时，提供转换正文供编码会话加载并明确会话级作用域。无持久定制机制的产品无法由仓库补出全局自动安装功能，不能承诺永久生效或隐瞒导入、登录、原生权限步骤。

## 去重、优先级与回滚

检查用户、项目及兼容目录里的同名/同义技能、原 Karpathy、旧路由和常驻指令。一个宿主读取同一正文一次；多个宿主明确支持的公共目录可以共享。公共配置不是所有工具都读的统一系统目录，不通过改名保留等价副本。

权限、项目及目录指令遵循宿主原生优先级，不发明跨工具覆盖顺序。Qoder CLI 和 Cline 的上述文档为同名用户优先，Lingma 该代文档为项目优先，Trae 原生项目技能优先于项目共享目录。正文尊重项目指令的要求不会改变原生解析器。

覆盖或移除前，备份原文件、权限、软链接目标及涉及的配置字段到发现目录之外，记录原路径与哈希。回滚先比较后续用户修改，只还原本次影响的文件/字段；新增且未再修改的文件才可移除。安装不能覆盖权限、MCP、hooks、插件、业务规则，也不能恢复用户已卸载的应用。

## 验收层次

文件正确 → 宿主发现或规则附加 → 隐式选择 → 行为 → 实际 token/费用，分别记录。转换测试只能证明正文完整、查询区分产品且不写配置，不能证明 88 个客户端全部运行通过。详见 [验证说明](verification.md)。
