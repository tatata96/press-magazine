<p align="center">
  <img src="public/images/logo.svg" alt="Press" width="160">
</p>

# Press

Website for Press, a cultural magazine with a minimal, print-inspired editorial design.

The first release is the QR-to-newsletter flow: a printed QR link opens the magazine information page, where visitors can sign up for the free newsletter and see a clear result. Commerce, accounts, PDF access, and a blog are planned for later work.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with strict TypeScript and React
- SCSS Modules for component styles, global SCSS for resets and typography
- [next-intl](https://next-intl.dev) for localisation (`en`, `tr`)
- [GSAP](https://gsap.com) for animation
- Shopify Admin API for newsletter signups (server-side only)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

### Environment variables

Read on the server only by [lib/shopify/admin-client.ts](lib/shopify/admin-client.ts). Never commit real values or expose them via `NEXT_PUBLIC_*`.

| Variable                | Purpose                         |
| ----------------------- | ------------------------------- |
| `SHOPIFY_STORE_DOMAIN`  | Shopify store domain            |
| `SHOPIFY_CLIENT_ID`     | Shopify app client ID           |
| `SHOPIFY_CLIENT_SECRET` | Shopify app client secret       |

## Project structure

```
app/
  [locale]/        Localised routes: home, about, newsletter
  api/newsletter/  Signup route handler (validation, rate limit, Shopify call)
  components/      Shared components (header, footer, form fields, ...)
  style/           Fonts
  utils/           Small shared helpers
i18n/              next-intl routing, navigation, and request config
lib/shopify/       Server-only Shopify Admin API client
messages/          Translations (en.json, tr.json)
public/            Static assets
```

## Conventions

- Project rules for contributors and coding assistants: [CLAUDE.md](CLAUDE.md)
- Naming, structure, and style conventions: [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md)

## Open decisions

Not final yet, so no behaviour should be assumed: newsletter provider and consent copy, form fields, payment setup, PDF download limits, and archive access rules.
