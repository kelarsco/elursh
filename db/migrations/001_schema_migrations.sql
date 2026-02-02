-- Migration: schema version tracking (run first).
-- Enables migration-driven deploys; run with: node scripts/run-migrations.js

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
