# Hospital Appointment API

A small, typed Node.js + Prisma 7 CRUD module for patients, doctors, and hospital appointments. The Prisma schema maps conventional TypeScript names onto the existing PostgreSQL tables/columns; no migrations are needed to apply those mappings.

## Requirements

- Node.js 20 or newer
- PostgreSQL
- npm

## Setup

```sh
npm install
cp .env.example .env
# Edit DATABASE_URL in .env for your PostgreSQL installation.
createdb hospital_api
psql -d hospital_api -f prisma/hospital-schema.sql
npx prisma generate
```

The SQL file creates the tables from the assignment. To practice introspection, run `npm run db:pull` against that database: Prisma will generate raw table/column names in `prisma/schema.prisma`. Restore the cleaned, mapped schema from version control afterward, then run `npm run db:generate`.

Prisma 7 reads its schema, datasource URL, and seed command from `prisma.config.ts`. The generated client is written to `generated/prisma/` and is intentionally ignored by Git; `prisma generate` recreates it.

## Seed and verify

```sh
npm run db:seed
npm run test:crud
```

`src/seed.ts` is a **development fixture seed** and clears appointments, patients, and doctors before inserting its fixtures. Do not run it against data you need to preserve. The CRUD test script creates uniquely named test records, exercises every exported operation (including relation `connect`/`include`, cancellation, patient-delete cascade, and doctor-delete restriction), and cleans up its fixtures.

## CRUD modules

- `src/patients.ts`: create, get, partial-name search, phone update, delete
- `src/doctors.ts`: create, get, specialty search, delete with a helpful message for PostgreSQL's `ON DELETE RESTRICT`
- `src/appointments.ts`: book with patient/doctor connections and nested results, full fetch, upcoming schedule, status update, bulk patient cancellation, delete
- `src/lib/prisma.ts`: singleton Prisma Client using the PrismaPg PostgreSQL driver adapter

Patients cascade-delete their appointments (`ON DELETE CASCADE`). Doctors cannot be deleted while appointments reference them (`ON DELETE RESTRICT`); delete those appointments first.
