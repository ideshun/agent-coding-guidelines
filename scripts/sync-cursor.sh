#!/usr/bin/env bash
# 将 skills/*/SKILL.md 正文同步进 adapters/cursor/rules/*.mdc，并可选择安装到目标项目。
# 用法:
#   ./scripts/sync-cursor.sh                 # 仅刷新 adapters 下的 .mdc
#   ./scripts/sync-cursor.sh /path/to/proj   # 刷新后复制到 目标项目/.cursor/rules/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

sync_one() {
  local name="$1"
  local src="$ROOT/skills/$name/SKILL.md"
  local dst="$ROOT/adapters/cursor/rules/$name.mdc"
  [ -f "$src" ] || { echo "missing $src" >&2; return 1; }
  # 去掉 SKILL.md 的 frontmatter，取正文
  local body
  body="$(awk 'BEGIN{f=0} /^---$/{c++; if(c==2){f=1; next}} f' "$src")"
  # 保留 .mdc 头部（第一个 include 标记之前的部分），替换 include 后内容
  awk -v body="$body" '
    /<!-- @include:/ { print; print body; skip=1; next }
    skip { next }
    { print }
  ' "$dst" > "$dst.tmp" && mv "$dst.tmp" "$dst"
  echo "synced: $name.mdc"
}

for s in global-coding-principles brainstorming plan verification react-typescript; do
  sync_one "$s"
done

if [ $# -ge 1 ]; then
  TARGET="$1/.cursor/rules"
  mkdir -p "$TARGET"
  # 只复制本套件的文件，不触碰目标项目已有的其他规则
  for s in global-coding-principles brainstorming plan verification react-typescript; do
    cp "$ROOT/adapters/cursor/rules/$s.mdc" "$TARGET/"
  done
  echo "installed to $TARGET (existing files with the same names were updated in place; other rules untouched)"
fi
