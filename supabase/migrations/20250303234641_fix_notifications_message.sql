-- Make message column nullable
ALTER TABLE public.notifications 
ALTER COLUMN message DROP NOT NULL;

-- Ensure content is populated for any rows that might have null content
UPDATE public.notifications
SET content = jsonb_build_object(
    'message', COALESCE(message, ''),
    'data', COALESCE(data, '{}'::jsonb)
)
WHERE content IS NULL;

-- Add NOT NULL constraint to content column
ALTER TABLE public.notifications 
ALTER COLUMN content SET NOT NULL; 