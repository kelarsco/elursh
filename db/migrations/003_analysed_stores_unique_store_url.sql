-- Deduplicate analysed_stores by store_url, then enforce one row per store.
-- Keeps the row with the highest id per store_url; deletes older duplicates.

DELETE FROM analysed_stores a
USING analysed_stores b
WHERE a.store_url = b.store_url
  AND a.id < b.id;

-- Enforce one row per store_url so re-analysis updates instead of inserting.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'analysed_stores_store_url_key'
  ) THEN
    ALTER TABLE analysed_stores ADD CONSTRAINT analysed_stores_store_url_key UNIQUE (store_url);
  END IF;
END $$;
