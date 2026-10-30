# Coding Conventions

Detailed rules referenced from CLAUDE.md. Add to this file as conventions are agreed.

## File and folder naming

- Next.js special files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`) keep their required lowercase names.
- Route folders in `app/` are lowercase; they become the URL (`app/about` → `/about`).
- Component folders are lowercase or kebab-case: `components/header/`, `components/site-footer/`.
- A file that exports a React component uses PascalCase and matches the component name: `Header.tsx` exports `Header`.
- Non-component files are lowercase: SCSS modules (`header.module.scss`), hooks, utilities, types.

## Component structure

Colocate a component with its styles in one folder:

```
app/components/header/
  Header.tsx
  header.module.scss
```

## Control flow

- Always use braces for `if`, `else`, `for`, and `while` bodies, even for a single statement. Enforced by the ESLint `curly` rule.

```ts
// Good
if (!email) {
  return;
}

// Bad
if (!email) return;
```

- Leave one blank line after a `const`/`let` declaration before the next statement. Consecutive declarations can stay together. Enforced by the ESLint `padding-line-between-statements` rule.

```ts
// Good
const email = getTrimmedString(body.email);
const age = Number(body.age);

if (!email) {
  return;
}

// Bad
const email = getTrimmedString(body.email);
if (!email) {
  return;
}
```

## Naming

Use descriptive names that say what a function does or what a variable holds. Apply them consistently across the code you touch.

- Functions are verbs that describe their action or return value: `getClientIpAddress`, `getTrimmedString`, `isSameOrigin`.
- Variables are nouns that describe their content: `validationErrors`, `existingCustomer`.
- Avoid vague names such as `text`, `next`, `existing`, `data`, or `key` when a specific one fits.
- Name wrappers after the action they perform: `requestShopifyAdminGraphQL` rather than `adminGraphQL`.
- Do not rename fields or operations required by an external API schema (for example Shopify's).

## Shared utilities

- Generic HTTP helpers (same-origin check, client IP, content-type check, response building) live in `app/utils/api.ts`.
- Generic string helpers live in `app/utils/string.ts`.
- Feature-specific validation rules, types, and error messages stay next to the endpoint that uses them.
- Route handlers keep the decisions about which HTTP response to return, so the request flow stays readable in `route.ts`.
- Create a utility file only when current code needs it; no empty placeholder modules.
