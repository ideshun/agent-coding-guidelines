# Codex 适配

Codex 官方机制（以 openai/codex 源码与文档为准）：

- 用户级全局指令：`~/.codex/AGENTS.md`（或 `AGENTS.override.md` 本地覆盖）。
- 项目级：仓库根到当前目录路径上的所有 `AGENTS.md` 按顺序级联合并；不会越过项目根（`.git`）。
- Skills：支持 user 与 repo 两种 scope，遵循标准 `SKILL.md`（含 frontmatter `name`/`description`），由目录发现与目录清单注入。

## 用法

1. **全局原则**：将本仓库 `skills/global-coding-principles/SKILL.md` 的正文（去掉 frontmatter）追加到你的 `~/.codex/AGENTS.md`，或复制本仓库 `skills/` 下各目录到你的 Codex skills 目录（user scope）/ 项目 `.codex/skills/`（repo scope，如你的版本支持）。
2. **项目级**：在项目根 `AGENTS.md` 中加一行引用本仓库路径或粘贴全局原则正文；不要覆盖项目已有的 AGENTS.md 内容。
3. 其余 skill（brainstorming / plan / verification / react-typescript）作为按需 skill 安装，不要并入全局 AGENTS.md —— 那会让每个任务都注入全部上下文。

不要修改 Codex 的全局 `config.toml` 中与本仓库无关的配置。
