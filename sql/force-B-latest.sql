-- Update the latest cancellation row for user_id = '1' to force variant B
UPDATE public.cancellations
SET downsell_variant = 'B', pending_cancellation = true, accepted_downsell = false
WHERE id = (
  SELECT id FROM public.cancellations
  WHERE user_id = '1'
  ORDER BY created_at DESC
  LIMIT 1
);

-- To fully reset cancellations for user_id = '1', uncomment below:
-- DELETE FROM public.cancellations WHERE user_id = '1';
