-- =============================================================
-- Trigger: NOTIFY en INSERT a transaction_log
-- Aplicar en cada nodo:
--   psql $NODE_A_DATABASE_URL -f prisma/sql/notify_transaction_log.sql
--   psql $NODE_B_DATABASE_URL -f prisma/sql/notify_transaction_log.sql
--   psql $NODE_C_DATABASE_URL -f prisma/sql/notify_transaction_log.sql
-- =============================================================

CREATE OR REPLACE FUNCTION fn_notify_transaction_log()
RETURNS trigger AS $$
DECLARE
  payload JSON;
  v_from  BIGINT;
  v_to    BIGINT;
  v_amt   NUMERIC;
  v_st    VARCHAR;
  v_node  TEXT;
BEGIN
  v_node := COALESCE(NEW.details::json->>'node_id', 'unknown');

  SELECT t.from_account_id, t.to_account_id, t.amount, t.status
    INTO v_from, v_to, v_amt, v_st
    FROM transactions t
   WHERE t.id = NEW.transaction_id;

  payload := json_build_object(
    'id',              NEW.id,
    'transaction_id',  NEW.transaction_id,
    'event_type',      NEW.event_type,
    'node_id',         v_node,
    'from_account_id', v_from,
    'to_account_id',   v_to,
    'amount',          v_amt,
    'status',          v_st,
    'created_at',      NEW.created_at
  );

  PERFORM pg_notify('transaction_log_events', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_transaction_log ON transaction_log;

CREATE TRIGGER trg_notify_transaction_log
  AFTER INSERT ON transaction_log
  FOR EACH ROW
  EXECUTE FUNCTION fn_notify_transaction_log();
