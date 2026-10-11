# React and TypeScript conventions

Apply only to a project that actually uses React and TypeScript, and only to relevant source files. Project architecture, lint/formatter settings, framework version, and existing code style take precedence. Do not rewrite existing code solely to impose these preferences.

- Prefer TypeScript and modern JavaScript/TypeScript syntax. Do not introduce `var`.
- Prefer arrow functions where they fit the project's style; retain ordinary functions when required by APIs, hoisting, generators, or local convention.
- Reuse existing components, hooks, dependencies, and patterns. In Ant Design, Umi, AG-Grid, or React Flow projects, follow the installed version and actual project APIs; do not assume these libraries are present.
- Keep code and comments concise. Explain non-obvious *why*, not the next line of code.
- When a new or changed method genuinely needs a method comment, use a JSDoc block with `@description:`. Do not add ceremonial comments to self-evident methods.
