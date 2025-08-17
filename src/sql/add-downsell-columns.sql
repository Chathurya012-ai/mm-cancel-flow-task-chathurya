-- Add downsell_variant and accepted_downsell to cancellations if missing
ALTER TABLE cancellations
  ADD COLUMN IF NOT EXISTS downsell_variant TEXT CHECK (downsell_variant IN ('A','B')),
  ADD COLUMN IF NOT EXISTS accepted_downsell BOOLEAN DEFAULT false;

-- Add pending_cancellation to subscriptions if missing
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS pending_cancellation BOOLEAN DEFAULT false;
