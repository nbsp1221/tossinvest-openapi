# Project Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. User constraints override the default skill template: do not create a worktree, do not commit, and do not stage files without explicit user approval.

**Goal:** Create a modern polyglot TypeScript/Python project scaffold with working lint, typecheck, test, build, and OpenAPI spec checks.

**Architecture:** `mise` is the root task runner and tool-version entry point. `pnpm` manages the TypeScript workspace, `uv` manages the Python workspace, and both language packages remain independent while sharing root commands and OpenAPI/spec directories.

**Tech Stack:** mise 2026.6.x, Node.js 22, pnpm 10, TypeScript 6, tsup, Vitest, ESLint, Python 3.12, uv, hatchling, Ruff, ty, pytest.

## Global Constraints

- Work in the current branch and current worktree.
- Do not commit.
- Do not run `git add` or otherwise stage files.
- Do not implement SDK API logic in this task.
- TypeScript is the MVP target, but Python must be scaffolded as a first-class package.
- Use official Toss Securities OpenAPI only.

---

### Task 1: Root Tooling

**Files:**
- Create: `mise.toml`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `pyproject.toml`
- Create: `.gitignore`
- Create: `.editorconfig`

**Interfaces:**
- Produces root commands: `mise run lint`, `mise run typecheck`, `mise run test`, `mise run build`, `mise run check`.
- Produces direct fallback commands through root `package.json` scripts.

- [ ] Create root workspace and task-runner files.
- [ ] Validate `mise tasks ls` discovers the task surface.

### Task 2: TypeScript Package Scaffold

**Files:**
- Create: `packages/typescript/package.json`
- Create: `packages/typescript/tsconfig.json`
- Create: `packages/typescript/eslint.config.js`
- Create: `packages/typescript/src/index.ts`
- Create: `packages/typescript/test/index.test.ts`

**Interfaces:**
- Produces package export `VERSION`.
- Produces package export `getPackageInfo()`.

- [ ] Create TypeScript package metadata and configuration.
- [ ] Write Vitest smoke test before implementation.
- [ ] Verify the smoke test fails before `src/index.ts` exists.
- [ ] Add minimal `src/index.ts`.
- [ ] Verify TypeScript test passes.

### Task 3: Python Package Scaffold

**Files:**
- Create: `packages/python/pyproject.toml`
- Create: `packages/python/src/tossinvest_openapi/__init__.py`
- Create: `packages/python/tests/test_package.py`

**Interfaces:**
- Produces package export `__version__`.
- Produces package export `get_package_info()`.

- [ ] Create Python package metadata and configuration.
- [ ] Write pytest smoke test before implementation.
- [ ] Verify the smoke test fails before package implementation exists.
- [ ] Add minimal package implementation.
- [ ] Verify Python test passes.

### Task 4: OpenAPI Spec Scaffold

**Files:**
- Create: `scripts/fetch-openapi.mjs`
- Create: `scripts/check-openapi.mjs`
- Create: `spec/upstream/openapi.json`
- Create directories: `spec/overlays`, `spec/snapshots`, `spec/generated`, `fixtures/responses`, `fixtures/errors`, `fixtures/orders`, `.github/workflows`

**Interfaces:**
- Produces `pnpm run fetch:openapi`.
- Produces `pnpm run spec:check`.

- [ ] Create OpenAPI helper scripts.
- [ ] Fetch the current official OpenAPI JSON.
- [ ] Verify spec file is structurally valid.

### Task 5: Installation And Verification

**Files:**
- Create generated lockfiles: `pnpm-lock.yaml`, `uv.lock`

**Interfaces:**
- Root verification succeeds through `mise run check`.

- [ ] Install JavaScript dependencies with `pnpm install`.
- [ ] Install Python dependencies with `uv sync --all-packages`.
- [ ] Run `mise run lint`.
- [ ] Run `mise run typecheck`.
- [ ] Run `mise run test`.
- [ ] Run `mise run build`.
- [ ] Run `mise run spec:check`.
- [ ] Run `mise run check`.
- [ ] Confirm no files were staged.
