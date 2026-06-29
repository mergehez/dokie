# AGENTS

This repository contains PHP, .NET, and JavaScript work. For JavaScript and TypeScript tasks, use these defaults unless a file or package already requires something else.

## JavaScript Tooling

- Use Bun as the package manager.
- Use Bun as the script runner.
- Prefer `tsdown` for JavaScript package builds in `packages/node`.
- Prefer Vite for application-style frontends such as `ui/` and `website/`.
- Do not introduce npm or pnpm lockfiles for JS package work unless explicitly requested.

## JS Package

- The JavaScript package lives in `packages/node/`.
- Run install, checks, and builds from `packages/node/`.
- The standard package build flow is: `bun install`, `bun run build`.

## Scripts

- Repository-level automation scripts live in `scripts/`.
- Prefer Bun-executable TypeScript scripts for repo automation.

## Editing Guidance

- Keep package outputs compatible with both ESM and CJS when the package already publishes both.
- Keep the Node package self-contained so published JS packages do not depend on private workspace packages at runtime.
