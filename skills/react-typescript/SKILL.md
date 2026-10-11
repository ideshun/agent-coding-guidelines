---
name: react-typescript
description: React + TypeScript coding conventions (React, TS, Ant Design, Umi, AG-Grid, React Flow, pnpm/npm/yarn). Scope to projects/files using this stack — never inject into unrelated codebases.
---

# React + TypeScript Conventions

Applies only where this stack is present. Respect the project's existing architecture and style first; never mass-refactor legacy code to match personal preference.

## Language

- TypeScript preferred for new code. Modern ES syntax; no `var`.
- Arrow functions over `function` declarations, unless hoisting or `this` semantics require otherwise.
- Keep code terse; comment only complex logic. Method docs use JSDoc blocks with a `@description:` prefix:

```ts
/**
 * @description: Resolve the effective row height for the current viewport.
 */
const resolveRowHeight = (viewport: Viewport): number => { ... }
```

## Framework Notes

- Follow the project's existing patterns for state, data fetching, and component structure. Don't introduce a new library when the project already solves it (Ant Design components, Umi conventions, existing hooks/utils).
- AG-Grid / React Flow: keep heavy config in dedicated modules; don't re-wrap the library without a concrete need.
- Package manager: match the repo (pnpm/npm/yarn). Don't add or upgrade dependencies as a side effect.

## Boundaries

These conventions never override the global principles (simplicity, surgical changes). If they conflict with the project's established style, the project wins.
