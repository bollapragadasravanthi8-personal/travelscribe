# TravelScribe

AI-powered travel journal application built with Next.js 15, Prisma, and Supabase.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes & Server Actions |
| Database | Prisma ORM + PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (travel photos) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Enable **Email** auth under Authentication → Providers (needed in Phase 2).
3. Create a Storage bucket named `travel-photos` under Storage (needed in Phase 6).

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key |
| `DATABASE_URL` | Project Settings → Database → Connection string → **Session pooler** (port **5432**) |
| `DIRECT_URL` | Same as above (Session pooler, port **5432**) — used for migrations |

**Important:** If your database password contains special characters (`@`, `#`, `%`), URL-encode them (`@` → `%40`). Use Supabase's **Copy** button to avoid mistakes.

**Connection string note:** Prisma loads `.env.local` automatically. Migrations run via `npm run db:migrate` using `DIRECT_URL`.

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (requires DATABASE_URL + DIRECT_URL)
npm run db:migrate
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Verify setup

```bash
curl http://localhost:3000/api/health
```

Expected response when configured:

```json
{
  "status": "ok",
  "service": "travelscribe",
  "checks": { "database": "ok", "supabase": "ok" }
}
```

### 7. Configure Supabase Auth (Phase 2)

In Supabase Dashboard → **Authentication → URL Configuration**:

| Setting | Value |
|---|---|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

Enable **Email** provider under Authentication → Providers.

### 8. Configure Supabase Storage (Phase 6)

In Supabase Dashboard → **Storage**:

1. Create a **public** bucket named `travel-photos` (or match `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`).
2. Add storage policies so authenticated users can manage files under their own folder (`{auth.uid()}/...`):

```sql
-- Upload
create policy "Users upload own travel photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'travel-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Read (public bucket — optional if bucket is public)
create policy "Public read travel photos"
on storage.objects for select to public
using (bucket_id = 'travel-photos');

-- Delete own files
create policy "Users delete own travel photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'travel-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated app routes
│   │   ├── dashboard/          # Dashboard overview
│   │   └── trips/              # Trips list & detail pages
│   │       └── [tripId]/
│   │           └── days/[dayId]/
│   ├── api/                    # API route handlers
│   └── layout.tsx
├── actions/                    # Server Actions
├── components/
│   ├── common/                 # Shared UI components
│   ├── layout/                 # App shell, sidebar, header
│   └── ui/                     # shadcn/ui primitives
├── config/                     # Site & app configuration
├── generated/prisma/           # Prisma client (auto-generated)
├── hooks/                      # Custom React hooks
├── lib/
│   ├── ai/                     # AI provider abstraction (mock for now)
│   ├── supabase/               # Supabase client utilities
│   ├── constants.ts
│   ├── env.ts
│   └── prisma.ts
├── repositories/               # Data access layer (Phase 3+)
├── services/                   # Business logic layer (Phase 3+)
└── types/                      # Shared TypeScript types
prisma/
├── schema.prisma               # Database schema
└── migrations/                 # Migration history
```

## Schema Notes

- **Note model** — kept as a separate table (multiple memos per travel day), extending the PRD's single-field design.
- **Trip.country** — maps to the PRD's country field.
- **Photo dual-link** — every photo is tagged to a travel day (`travelDayId`, required) for search and day galleries. Photos may optionally link to a memo (`noteId`) for memo-specific galleries. Day-only photos have `noteId = null`. When a memo is deleted, its photos remain on the day with `noteId` cleared.
- **Trip.aiStory** — AI-generated trip narrative (Phase 10).

## Routes

| Route | Description |
|---|---|
| `/login` | Sign in |
| `/signup` | Create account |
| `/auth/callback` | Supabase auth callback |
| `/dashboard` | Overview and recent activity |
| `/trips` | All trips |
| `/trips/[tripId]` | Trip details |
| `/trips/[tripId]/days/[dayId]` | Travel day details |
| `/api/health` | Health check endpoint |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Development Phases

- [x] **Phase 1** — Project setup, Supabase, Prisma, schema, migrations
- [x] **Phase 2** — Authentication (sign up, login, logout, route protection)
- [x] **Phase 3** — Trip CRUD
- [x] **Phase 4** — Travel Day CRUD
- [x] **Phase 5** — Expense Tracking
- [x] **Phase 6** — Photo Uploads
- [x] **Phase 7** — Dashboard
- [x] **Phase 8** — AI Day Summaries
- [x] **Phase 9** — AI Captions
- [x] **Phase 10** — AI Story Generator
- [ ] **Phase 11** — Travel Memory Chat (RAG)

## License

Private — all rights reserved.
