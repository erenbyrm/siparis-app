-- Run once in the same test project's SQL Editor after deploying the compatible API.
-- Keeps the pre-migration workspace as a private recovery snapshot. Does not delete business records.
BEGIN;
CREATE TABLE IF NOT EXISTS siparis_private.records (
 collection text NOT NULL,
 id text NOT NULL,
 position integer NOT NULL CHECK (position >= 0),
 payload jsonb NOT NULL,
 PRIMARY KEY (collection,id),
 CHECK (payload->>'id'=id),
 CHECK (collection IN ('products','customers','users','orders','audit','stockRequests','inventory.movements','inventory.batches','inventory.adjustments','inventory.discrepancies','documentBook.brands','documentBook.records'))
);
CREATE TABLE IF NOT EXISTS siparis_private.migration_backup (
 id boolean PRIMARY KEY DEFAULT true CHECK (id),
 data jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE siparis_private.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE siparis_private.migration_backup ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON siparis_private.records,siparis_private.migration_backup FROM PUBLIC,anon,authenticated;
DO $$
DECLARE original jsonb; meta jsonb; collection text; items jsonb; present jsonb := '[]'::jsonb;
BEGIN
 SELECT data INTO original FROM siparis_private.workspace WHERE id=true FOR UPDATE;
 IF original IS NOT NULL AND original->>'storageVersion'='1' THEN RETURN; END IF;
 IF original IS NULL THEN
  original := '{"schemaVersion":2,"revision":0,"products":[],"customers":[],"users":[],"orders":[],"audit":[],"inventory":{"movements":[],"batches":[],"adjustments":[]}}'::jsonb;
 ELSE
  INSERT INTO siparis_private.migration_backup(id,data) VALUES(true,original) ON CONFLICT(id) DO NOTHING;
 END IF;
 IF original->>'schemaVersion' IS DISTINCT FROM '2' THEN RAISE EXCEPTION 'Unsupported workspace schema'; END IF;
 meta := original - 'stockSummary' - 'productionPlan';
 FOREACH collection IN ARRAY ARRAY['products','customers','users','orders','audit','stockRequests','inventory.movements','inventory.batches','inventory.adjustments','inventory.discrepancies','documentBook.brands','documentBook.records'] LOOP
  items := original #> string_to_array(collection,'.');
  IF jsonb_typeof(items)='array' THEN
   INSERT INTO siparis_private.records(collection,id,position,payload)
    SELECT collection,value->>'id',(ordinality-1)::integer,value FROM jsonb_array_elements(items) WITH ORDINALITY;
   present := present || jsonb_build_array(collection);
   meta := meta #- string_to_array(collection,'.');
  END IF;
 END LOOP;
 INSERT INTO siparis_private.workspace(id,data) VALUES(true,jsonb_build_object('storageVersion',1,'meta',meta,'collections',present))
  ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data,updated_at=now();
END $$;
COMMIT;
