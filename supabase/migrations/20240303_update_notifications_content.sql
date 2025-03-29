-- Add content column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS content JSONB;

-- Migrate existing data
UPDATE public.notifications
SET content = jsonb_build_object(
    'message', message,
    'data', data
)
WHERE content IS NULL;

-- Drop old columns (optional, commented out for safety)
-- ALTER TABLE public.notifications DROP COLUMN message;
-- ALTER TABLE public.notifications DROP COLUMN data;

-- Update the notification trigger function to use content
CREATE OR REPLACE FUNCTION public.notify_admins_of_registration()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Insert notifications for all admin users
    FOR admin_id IN SELECT * FROM public.get_admin_user_ids() LOOP
        INSERT INTO public.notifications (type, content, user_id)
        VALUES (
            'bus_company_registration',
            jsonb_build_object(
                'booking_id', NULL,
                'trip_id', NULL,
                'passenger_id', NULL,
                'passenger_name', NULL,
                'trip_details', jsonb_build_object(
                    'company_name', NEW.company_name,
                    'email', NEW.email,
                    'registration_id', NEW.id
                )
            ),
            admin_id
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 