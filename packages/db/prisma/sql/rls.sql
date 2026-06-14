-- Bid OS — Postgres Row-Level Security (defense-in-depth).
--
-- The application already isolates tenants via the Prisma `forWorkspace()`
-- extension. RLS is a SECOND line of defense at the database layer: even a
-- forgotten `WHERE workspace_id = ...` cannot leak data across tenants.
--
-- Usage: the app sets `SET app.current_workspace = '<workspaceId>'` per request
-- (via a connection-scoped transaction) and connects as a NON-superuser role.
-- Apply after `prisma migrate deploy`:
--   psql "$DATABASE_URL" -f prisma/sql/rls.sql

DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'Membership','Subscription','Invoice','Payment','UsageMeter',
    'Tender','TenderDocument','ExtractionRun','Requirement','Attachment',
    'Deadline','RiskItem','GapItem','BidScore','Proposal','ProposalSection',
    'CompanyDocument','DecisionLog','Task','Comment','Notification','AuditLog'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'DROP POLICY IF EXISTS tenant_isolation ON %I;', t
    );
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("workspaceId" = current_setting(''app.current_workspace'', true));',
      t
    );
  END LOOP;
END $$;
