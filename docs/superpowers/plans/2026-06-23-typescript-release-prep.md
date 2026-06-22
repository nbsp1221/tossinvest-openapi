# TypeScript Release Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the TypeScript package for its first npm release without publishing it.

**Architecture:** Keep release metadata inside `packages/typescript`, keep root orchestration unchanged, and add a dedicated GitHub Actions workflow that can publish the TypeScript package later through npm Trusted Publishing. Generate package version constants from `package.json` so exported `VERSION` and User-Agent cannot drift silently.

**Tech Stack:** TypeScript, pnpm, npm CLI, GitHub Actions, npm Trusted Publishing with OIDC, mise.

## Global Constraints

- Do not use git worktrees.
- Do not publish the package.
- Keep package dependency versions exact.
- Use npm Trusted Publishing/OIDC as the prepared release path.
- Keep file endings to exactly one trailing newline.

---

### Task 1: Package Metadata and Version Constants

**Files:**

- Modify: `packages/typescript/package.json`
- Create: `packages/typescript/LICENSE`
- Create: `packages/typescript/src/version.ts`
- Modify: `packages/typescript/src/index.ts`
- Modify: `packages/typescript/src/client.ts`

**Interfaces:**

- Produces: `VERSION`, `PACKAGE_NAME`, `DEFAULT_USER_AGENT`, and `getPackageInfo()` from `src/version.ts`.
- Consumes: `DEFAULT_USER_AGENT` in `TossInvestClient`.

- [ ] Set package version to `0.1.0`, add `license: "MIT"`, add `publishConfig` for public npm registry publication, and include `LICENSE` in the package files.
- [ ] Copy the root MIT license into the TypeScript package root so the npm tarball includes license text.
- [ ] Move version-related exports from `src/index.ts` to `src/version.ts`.
- [ ] Import `DEFAULT_USER_AGENT` from `src/version.ts` in `src/client.ts`.

### Task 2: Version Sync and Docs

**Files:**

- Create: `packages/typescript/scripts/sync-version.mjs`
- Modify: `packages/typescript/package.json`
- Modify: `packages/typescript/README.md`
- Modify: `packages/typescript/README.en.md`

**Interfaces:**

- Produces: `pnpm sync:version` and `pnpm check:version`.
- Consumes: `package.json` and `src/version.ts`.

- [ ] Add a script that generates `src/version.ts` from package metadata and supports `--check` for CI.
- [ ] Add `sync:version` to the TypeScript package scripts.
- [ ] Add `check:version` to the TypeScript package scripts.
- [ ] Mention that the package is ESM-only and targets Node.js 22+ in both package READMEs.

### Task 3: npm Trusted Publishing Workflow

**Files:**

- Create: `.github/workflows/release-typescript.yml`
- Modify: `README.md`
- Modify: `README.en.md`

**Interfaces:**

- Produces: a release workflow that runs on GitHub Release publication and publishes `packages/typescript` with npm Trusted Publishing when configured on npmjs.com.

- [ ] Add a GitHub Actions workflow with `id-token: write`, `contents: read`, GitHub-hosted `ubuntu-latest`, `actions/checkout@v7`, `jdx/mise-action@v4`, `npm@11.17.0`, `mise run install`, `mise run check`, `npm publish --access public`.
- [ ] Use the package directory as the publish working directory.
- [ ] Document that npm trusted publisher settings must point to `release-typescript.yml`.

### Task 4: Verification

**Files:**

- No source changes.

**Interfaces:**

- Consumes: all changes from Tasks 1-3.

- [ ] Run `mise run check`.
- [ ] Run `pnpm --dir packages/typescript check:version`.
- [ ] Run `npm publish --dry-run --access public` from `packages/typescript`.
- [ ] Pack and install the tarball in `/tmp`, then run TypeScript typecheck and ESM runtime import.
- [ ] Verify `git status -sb --untracked-files=all`.
