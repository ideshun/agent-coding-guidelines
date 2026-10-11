# Claude Code 适配

Claude Code 官方机制：

- 用户级：`~/.claude/CLAUDE.md`；项目级：仓库根 `CLAUDE.md`（自动加载）。
- Skills：`~/.claude/skills/<name>/SKILL.md`（个人）或项目 `.claude/skills/<name>/SKILL.md`，frontmatter 需含 `name` 与 `description`，按 description 相关性自动触发。

## 用法

1. 将 `skills/global-coding-principles/SKILL.md` 正文追加到 `~/.claude/CLAUDE.md`（保留你已有内容，只追加不覆盖）。
2. 其余四个 skill 目录复制到 `~/.claude/skills/`（跨项目）或项目 `.claude/skills/`（单项目）。
3. react-typescript 的 description 已限定触发场景；如想更严格，可只在对应项目安装。
