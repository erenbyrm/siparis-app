BEGIN;
CREATE SCHEMA IF NOT EXISTS siparis_private;
REVOKE ALL ON SCHEMA siparis_private FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS siparis_private.workspace (
 id boolean PRIMARY KEY DEFAULT true CHECK (id),
 data jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS siparis_private.requests (
 id uuid PRIMARY KEY,
 actor_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE siparis_private.workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE siparis_private.requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA siparis_private FROM PUBLIC, anon, authenticated;
COMMIT;
-- Only the server-side database connection accesses these tables.
-- No public/authenticated policies: Supabase REST clients cannot read or change them.
