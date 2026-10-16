# AGENTS.md

This file holds only the facts that the code, `package.json` and `README.md` do not show. For setup, ports, seed users and tests, read `README.md`.

## Rules

- Write commit messages and pull request titles as `type(scope): subject`. See <https://contribute.freecodecamp.org/how-to-open-a-pull-request>.
- Before you push, run `pnpm run lint` and `pnpm test`. `pnpm run lint` also runs the type check and the format check.

## Gotchas

- Import `toast` and `ToastContainer` from `react-toastify/unstyled`. The package root and `react-toastify/unstyled` are separate bundles with separate containers, so a toast from the other entry point does not show.
- `postinstall` generates the Prisma client into `generated/`, which Git ignores. After you change `prisma/schema.prisma`, run `pnpm exec prisma generate`. Import the client from `prisma/prisma.ts`.
- At boot, `instrumentation.ts` checks the environment with `util/env.ts` and stops the server on a problem. Add a new required variable to `util/env.ts` and to `.env.sample`.
- `prisma/seed.ts` refuses a database that is not local (`util/seedGuard.ts`). Keep this check.
- The dashboards read the freeCodeCamp API when `FCC_API_URL` is set. Otherwise, they read the mock data server (`pnpm run mock-fcc-data`, port 3002).
- `REFACTOR_SUMMARY.md`, `mermaid.md` and `util/mermaid.md` are out of date. Use the code as the source.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
