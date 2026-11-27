# Pizzarush — Pizza Ordering Platform

A full-stack pizza ordering platform where customers browse restaurants, order food, and
track their orders, vendors manage their menu and orders, and admins moderate the whole
marketplace. The storefront is branded **PizzaHub**.

- **Live website:** https://pizzarush-g1jn.vercel.app
- **Client repository:** https://github.com/webzelo/pizzarush
- **Server repository:** https://github.com/webzelo/pizzarush-server

## Table of Contents

- [Overview](#overview)
- [Important Features](#important-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Run Locally](#run-locally)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

## Overview

Pizzarush is an npm-workspaces monorepo (Turborepo) with three parts:

| Part | Location | Role |
| --- | --- | --- |
| Web app | `apps/web` | Next.js 16 App Router frontend, Better Auth, Stripe checkout, dashboards |
| Shared UI | `packages/ui` | shadcn/ui components, Tailwind theme, hooks shared across apps |
| REST API | [`pizzarush-server`](https://github.com/webzelo/pizzarush-server) | Express 5 + MongoDB service for menu data, filters, and reviews |

The web app owns users, orders, favourites, reviews, subscriptions, and payments in MongoDB;
the Express API owns the menu catalogue and is consumed by both server components and the
browser.

## Important Features

**Authentication & roles**

- Email/password sign-up and sign-in plus optional Google OAuth, powered by Better Auth.
- Role-based access for `customer`, `vendor`, and `admin`, enforced in layouts and data access.
- Blocked accounts are prevented from creating sessions and redirected to `/blocked`.

**Customer experience**

- Animated landing page (hero, featured items, category carousel, how-it-works, footer).
- Menu browsing with category filters, item detail pages, and per-route loading/error/not-found states.
- Favourites, order history, order detail view, and profile management.
- Pending orders can be cancelled from the dashboard.
- Dashboard with order statistics, status donut chart, and weekly order trend.

**Vendor dashboard**

- Menu management: create, edit, and delete dishes with image uploads through the imgbb API.
- Order management: review incoming orders and accept or reject them.
- Free vs Premium plans — Free allows 3 active menu items; Premium unlocks unlimited items,
  a premium badge, and featured homepage placement.
- Premium upgrade through Stripe Checkout, with a webhook handler at `/api/webhooks/stripe`.

**Admin dashboard**

- User management (roles, banning/unbanning with a reason), menu moderation, review
  moderation, and transaction history.
- Overview charts and statistics for the marketplace.

**Platform & UI**

- Order status email notifications through the Resend REST API.
- Responsive dashboards built on shared shadcn/ui components.
- Light/dark theme toggle, toast notifications, and Framer Motion page animations.
- Zod validation shared between forms, server actions, and API payloads.

## Technology Stack

### Frontend (`apps/web`)

| Package | Version | Purpose |
| --- | --- | --- |
| `next` | 16.4.5 | App Router framework (Turbopack builds) |
| `react` / `react-dom` | 19.3.1 | UI runtime |
| `typescript` | ^5 | Type safety |
| `tailwindcss` + `@tailwindcss/postcss` | ^4 | Styling (CSS-first config, no JS config) |
| `@base-ui/react` | ^1.9.0 | Accessible primitives behind the shadcn `base-nova` style |
| `shadcn` | ^4.23.0 | Component generator (writes into `packages/ui`) |
| `class-variance-authority`, `cn`, `tw-animate-css` | — | Variants, class merging, animations |
| `lucide-react` | ^1.75.0 | Icon set |
| `framer-motion` | ^14.14.0 | Page and section animations |
| `embla-carousel-react` | ^8.6.0 | Category carousel |
| `next-themes` | ^0.4.6 | Dark/light theme |
| `zod` | ^4.6.7 | Schema validation |
| `better-auth`, `@better-auth/mongo-adapter` | ^1.7.26 | Authentication and MongoDB adapter |
| `mongodb` | ^7.9.0 | Database driver |
| `stripe` | ^23.2.0 | Premium subscription checkout and webhooks |

### Server (`pizzarush-server`)

| Package | Purpose |
| --- | --- |
| `express` ^5.3.0 | REST API for menu, filters, reviews, users |
| `mongodb` ^7.9.1 | Shared database access |
| `cors` | Allows the web app origin |
| `dotenv` | Environment loading |
| `stripe` ^23.2.0 | Stripe SDK availability |

### Tooling

| Package | Purpose |
| --- | --- |
| `turbo` ^2.11.10 | Monorepo task runner (`dev`, `build`, `lint`, `typecheck`, `format`) |
| npm workspaces (`npm@11.17.0`) | Package management (only `package-lock.json` is used) |
| `eslint` ^10 + `@workspace/eslint-config` | Shared flat ESLint configs |
| `prettier` ^3.9.10 + `prettier-plugin-tailwindcss` | Formatting and Tailwind class sorting |

## Project Structure

```text
pizzarush/
├─ apps/
│  └─ web/                  # Next.js app (App Router)
│     ├─ app/
│     │  ├─ (site)/         # Storefront: home, menu, item detail, auth pages
│     │  ├─ customer/       # Customer dashboard, orders, favourites, profile
│     │  ├─ vendor/         # Vendor dashboard, menu CRUD, orders, subscription
│     │  ├─ admin/          # Admin dashboard, users, menu, reviews, transactions
│     │  └─ api/            # auth, session-token, uploads, stripe webhook handlers
│     ├─ components/        # Feature components (site, dashboard, admin, vendor)
│     ├─ lib/               # auth, data access, actions, stripe, email, validation
│     └─ scripts/           # db-init, seed-admin, seed-menu
├─ packages/
│  ├─ ui/                   # Shared shadcn/ui components and Tailwind theme
│  ├─ eslint-config/        # Shared ESLint flat configs
│  └─ typescript-config/    # Shared tsconfig presets
└─ turbo.json
```

## Installation

### Prerequisites

- Node.js **>= 20.9.0** and npm **11+**
- A MongoDB database (MongoDB Atlas or a local server)
- The Express API running locally (see the [server repository](https://github.com/webzelo/pizzarush-server))

### Steps

```bash
# 1. Clone the client
git clone https://github.com/webzelo/pizzarush.git
cd pizzarush

# 2. Install all workspace dependencies
npm install

# 3. Create the environment file (Next.js loads .env* from apps/web, not the repo root)
cp apps/web/.env.example apps/web/.env.local
# then fill in the values listed in the Environment Variables section

# 4. Initialise collections and seed data
npm run db:init -w web
npm run seed:admin -w web
npm run seed:menu -w web

# 5. Clone and start the API in a second terminal
git clone https://github.com/webzelo/pizzarush-server.git
cd pizzarush-server
npm install
npm run dev
```

## Run Locally

Start the web app from the repository root:

```bash
npm run dev
```

- Web app: http://localhost:3000
- Express API: http://localhost:5000 (started from the server repo)

To work on one workspace only:

```bash
npm run dev -w web        # Next.js only
npm run typecheck -w web  # typecheck the app
npm run lint -w @workspace/ui
```

Add new shadcn components from the repo root so they land in the shared package:

```bash
npx shadcn@latest add <component> -c apps/web
```

> Note: there is no test runner configured. Verify changes with `npm run typecheck` and
> `npm run build`.

## Environment Variables

### Web app — `apps/web/.env.local`

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_URL` | Yes | Public base URL of the app (`http://localhost:3000` locally, deployment URL in production) |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign sessions and cookies |
| `BETTER_AUTH_DB_URI` | Yes | MongoDB connection string (database name: `pizzahub`) |
| `API_URL` | Yes | Server-side base URL of the Express API (`http://localhost:5000`) |
| `NEXT_PUBLIC_API_URL` | Yes | Browser-side base URL of the Express API (`http://localhost:5000`) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL used for Stripe redirects |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID (enables Google sign-in) |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `IMGBB_API_KEY` | Optional | API key for vendor menu image uploads |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key for premium subscription checkout |
| `STRIPE_WEBHOOK_SECRET` | Optional | Signing secret for `/api/webhooks/stripe` |
| `RESEND_API_KEY` | Optional | Resend API key for order status emails |
| `EMAIL_FROM` | Optional | Sender address used in notification emails |

`NEXT_PUBLIC_*` variables are exposed to the browser; everything else is server-only.
Google sign-in, image uploads, payments, and emails degrade gracefully when their keys are
absent, so the app runs with only the required variables set.

### Express API — `pizzarush-server/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port (defaults to `5000`) |
| `MONGODB_URI` | Yes\* | Full MongoDB connection string |
| `DB_USER` / `DB_PASSWORD` | Yes\* | Alternative to `MONGODB_URI` for Atlas clusters |
| `CLIENT_ORIGIN` | Recommended | Allowed CORS origin (defaults to `http://localhost:3000`) |
| `ADMIN_API_KEY` | Yes for admin routes | Protects the `/users` endpoint |

\* Provide either `MONGODB_URI` or both `DB_USER` and `DB_PASSWORD`.

## Available Scripts

### Root (runs across all workspaces via Turbo)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server in `apps/web` |
| `npm run build` | Build every workspace |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier with Tailwind class sorting |

### `apps/web`

| Command | Description |
| --- | --- |
| `npm run dev -w web` | Next.js dev server |
| `npm run build -w web` | Production build |
| `npm run start -w web` | Serve the production build |
| `npm run db:init -w web` | Create collections and indexes |
| `npm run seed:admin -w web` | Seed an admin account |
| `npm run seed:menu -w web` | Seed sample menu items |

## Deployment

- The web app is deployed on Vercel from the `main` branch of the client repository.
- Add every variable from the table above to the Vercel project (Production and Preview)
  before deploying — `.env*` files are git-ignored and never shipped.
- Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the deployed domain, and point
  `API_URL` / `NEXT_PUBLIC_API_URL` at the deployed Express API.
- Register `https://<your-domain>/api/webhooks/stripe` as the Stripe webhook endpoint and
  copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
- The Express API is hosted separately; allow the deployed web origin in `CLIENT_ORIGIN`.
