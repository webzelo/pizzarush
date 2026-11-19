<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pizzarush

Turborepo + npm-workspaces monorepo for a Next.js 16.4.5 App Router app (`apps/web`) with shadcn/ui components shared from `packages/ui`. Next 16 builds with Turbopack. No tests or CI are configured.

## Commands

Run from the repo root. Use npm (`packageManager: npm@11.17.0`); the README's `pnpm`/`pnpm dlx` commands are stale — only `package-lock.json` exists.

- `npm install` — installs all workspaces.
- `npm run dev` — Turbo starts the Next dev server in `apps/web` (direct: `npm run dev -w web`).
- `npm run typecheck` / `npm run lint` / `npm run build` — run in every workspace through Turbo.
- Focus one workspace with npm's `-w`: `npm run typecheck -w web`, `npm run lint -w @workspace/ui`.
- Add shadcn components from the repo root: `npx shadcn@latest add <name> -c apps/web`. They are written to `packages/ui/src/components`, not `apps/web/components`.
- Format with `npm run format` (Prettier: no semicolons, double quotes, LF, Tailwind class sorting). It only rewrites `.ts`/`.tsx`.
- Lint is a weak check: the shared flat configs have no `files` glob for `.ts`/`.tsx`, so ESLint skips them ("File ignored because no matching configuration") and only checks `.js`. It also exits 0 on real findings because `eslint-plugin-only-warn` downgrades errors to warnings. Workspace flat configs are used; the root `.eslintrc.js` is not.
- No test runner exists; verify changes with `npm run typecheck` and `npm run build` (the build runs TypeScript).

## Structure and conventions

- `apps/web` is the only app: `app/layout.tsx`, `app/page.tsx`, and the Better Auth handler at `app/api/auth/[...all]/route.ts`.
- Put reusable UI in `packages/ui`, then import it as `@workspace/ui/components/*`, `@workspace/ui/lib/*`, or `@workspace/ui/hooks/*`. `apps/web/tsconfig.json` maps those to `packages/ui/src/*`; `next.config.ts` sets `transpilePackages: ["@workspace/ui"]`.
- Shared configs live in `packages/eslint-config` and `packages/typescript-config`; extend them instead of adding duplicate rules.
- The UI stack is shadcn `base-nova` on Base UI (`@base-ui/react`), not Radix. Expect Base UI APIs such as the `render` prop rather than `asChild`.
- `cn` is re-exported from the `cn` npm package in `packages/ui/src/lib/utils.ts`; don't replace it with clsx + tailwind-merge.
- Tailwind v4 has no JS config. Theme tokens and `@source` globs are in `packages/ui/src/styles/globals.css`.

## Auth and environment

- Better Auth with the MongoDB adapter. `apps/web/lib/auth.ts` hardcodes `mongodb://localhost:27017` and database `pizzarush`, so local MongoDB must be running.
- `BETTER_AUTH_SECRET` is required; set `BETTER_AUTH_URL` too so callbacks and redirects work reliably. Google sign-in also reads `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (not present in `.env`).
- Next loads `.env*` from the app directory (`apps/web`), not the repo root. The existing root `.env` is therefore invisible to the app; put auth vars in `apps/web/.env.local` (both files are gitignored).
- `better-auth`, `mongodb`, and `@better-auth/mongo-adapter` are currently declared in the root `package.json` and resolve through hoisting; `apps/web/package.json` does not list them.
