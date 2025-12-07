# Database & Migration Guide

This project uses Prisma with SQLite for local development. The canonical schema lives in `prisma/schema.prisma`; the Prisma client and migrations are generated from that file. Follow the procedures below to keep your local database healthy and in sync with the repository.

## 1. Initial Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` (if it exists) and set `DATABASE_URL`. For SQLite we use `file:./prisma/dev.db`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

## 2. Creating or Recreating the Local Database

Because the repo started with `prisma db push`, the earliest “init” migration isn’t tracked. Whenever you need a clean database, regenerate it directly from the schema:

```bash
rm prisma/dev.db              # optional, removes the old database file
npx prisma db push --force-reset
```

`db push` reads `schema.prisma` and creates every table without relying on historical migrations. Use this after cloning the repo or whenever the schema drifts out of sync.

## 3. Seeding

After the schema is in place, seed baseline data:

```bash
npm run db:seed
```

The seed script populates tenants, permissions, roles, and the default admin user.

## 4. Developing Schema Changes

1. Update `prisma/schema.prisma`.
2. Generate a named migration:
   ```bash
   npx prisma migrate dev --name add_new_feature
   ```
3. Verify the migration folder under `prisma/migrations/` is checked in.
4. Reseed if required (`npm run db:seed`).

## 5. Resolving Migration Drift

If Prisma reports missing or failed migrations (e.g. when switching branches):

```bash
rm prisma/dev.db
npx prisma db push --force-reset
npm run db:seed
```

This wipes the local SQLite database and rebuilds it from the current schema. **Never run `--force-reset` against a production database.**

## 6. Production Deployment Notes

* Always run migrations via CI/CD or a controlled environment: `npx prisma migrate deploy`.
* **`prisma migrate deploy` is production-safe:**
  - Only applies pending migrations that haven't been run yet
  - Never deletes data or existing tables
  - Never resets the database
  - Safe to run on every deployment
* Backup the database before applying migrations to shared environments (best practice).
* Avoid `db push` in production; rely on the committed migrations instead.
* The Vercel build script automatically runs `prisma migrate deploy` on every deployment.

## 7. Additional Tips

* `.next/` and `prisma/dev.db` are ignored in Git. If you see them staged, remove them before committing.
* Running `npx prisma migrate reset` is a convenience command that:
  - Drops the database.
  - Applies migrations in order.
  - Reruns the seed script.
  Use it only on local/dev databases and with caution—it is destructive.
* Prisma warns that `package.json#prisma` is deprecated; migrating to `prisma.config.ts` is future work.

## 8. Quick Reference

| Task                              | Command(s) |
|-----------------------------------|------------|
| Install deps                      | `npm install` |
| Regenerate schema & tables        | `npx prisma db push --force-reset` |
| Seed data                         | `npm run db:seed` |
| Load demo data                    | `npm run dev` |
| Create new migration              | `npx prisma migrate dev --name <name>` |
| Apply migrations in CI/prod       | `npx prisma migrate deploy` |
| Hard reset local DB (dangerous)   | `npx prisma migrate reset` |

Refer back to this guide whenever you need to rebuild or troubleshoot the local database.
