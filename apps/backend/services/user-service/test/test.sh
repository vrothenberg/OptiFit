#!/bin/bash
# docker exec -it some-postgres psql -U postgres -c "DROP DATABASE IF EXISTS optifit_test;"
# docker exec -it some-postgres psql -U postgres -c "CREATE DATABASE optifit_test;"
# NODE_ENV=test npm run test:e2e -- auth.e2e-spec.ts

# No need to drop/create PostgreSQL database since we're using SQLite
NODE_ENV=test npm run test:e2e -- auth.e2e-spec.ts