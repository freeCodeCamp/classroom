#!/usr/bin/env bash
set -euo pipefail

cat <<'MSG'

  Classroom is ready. Dependencies are installed, Postgres and Mailpit
  are running, and the database is seeded.

  Start the app and the mock fCC data server in two terminals:

      pnpm run develop
      pnpm run mock-fcc-data

  Mailpit shows sent email on port 8026.

MSG
