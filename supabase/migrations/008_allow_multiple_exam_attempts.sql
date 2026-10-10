BEGIN;

ALTER TABLE public.exam_registrations
  DROP CONSTRAINT IF EXISTS unique_user_reg;

ALTER TABLE public.exam_registrations
  ADD COLUMN IF NOT EXISTS attempt_number integer;

WITH numbered_attempts AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY registered_at, id
    )::integer AS attempt_number
  FROM public.exam_registrations
)
UPDATE public.exam_registrations AS registrations
SET attempt_number = numbered_attempts.attempt_number
FROM numbered_attempts
WHERE registrations.id = numbered_attempts.id;

ALTER TABLE public.exam_registrations
  ALTER COLUMN attempt_number SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_user_attempt_number'
      AND conrelid = 'public.exam_registrations'::regclass
  ) THEN
    ALTER TABLE public.exam_registrations
      ADD CONSTRAINT unique_user_attempt_number UNIQUE (user_id, attempt_number);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_exam_attempt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.attempt_number IS NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

    SELECT COALESCE(MAX(attempt_number), 0) + 1
    INTO NEW.attempt_number
    FROM public.exam_registrations
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_exam_attempt_number
  ON public.exam_registrations;

CREATE TRIGGER assign_exam_attempt_number
  BEFORE INSERT ON public.exam_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_exam_attempt_number();

COMMIT;