# Digital Menu Platform — AGENTS.md (Production Ready)

## 1. Objective

Build a production-ready digital menu SaaS platform using Nuxt 3 (full-stack).

## 2. Tech Stack

- Nuxt 3 (Vue 3 full-stack)
- ShadCN UI + Tailwind
- Cloudflare D1 (SQLite)
- Cloudflare R2

## 3. Architecture

- server/api → routes
- server/services → business logic
- server/db → database
- server/utils → helpers

## 4. Database Schema

restaurants:

- id (UUID)
- name
- slug (unique)

menu_items:

- id (UUID)
- restaurant_id (FK)
- name
- description
- price
- image_url
- is_available

## 5. API

- GET /api/public/menu?slug=
- POST /api/admin/menu
- PUT /api/admin/menu/:id
- DELETE /api/admin/menu/:id
- POST /api/upload

## 6. Storage (R2)

- Use pre-signed URLs
- Path: menus/{restaurant_id}/{filename}

## 7. Security

- Validate input (Zod)
- JWT auth
- Rate limiting
- HTTPS only

## 8. Coding Rules

- TypeScript everywhere
- No business logic in components
- Services layer required

## 9. Performance

- SSR or hybrid
- Cache public APIs
- Optimize images

## 10. Deployment

- Cloudflare Pages or Vercel
- Set env variables

## 11. Done Criteria

- CRUD menu works
- Images upload
- Public menu accessible
- Secure + deployable
