-- Drop existing notification triggers and functions
DROP TRIGGER IF EXISTS on_bus_company_registration ON bus_companies;
DROP FUNCTION IF EXISTS notify_admins_of_registration();

-- Ensure notifications table has all required columns
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS content JSONB,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ALTER COLUMN message DROP NOT NULL; -- Make message nullable since we're moving to content

-- Create function to get admin user IDs
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated notification function for bus company registrations
CREATE OR REPLACE FUNCTION notify_admins_of_registration()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Insert notifications for all admin users
    FOR admin_id IN SELECT * FROM get_admin_user_ids() LOOP
        INSERT INTO notifications (
            type,
            message, -- Keep for backward compatibility
            content,
            user_id
        )
        VALUES (
            'NEW_BUS_COMPANY_REGISTRATION',
            'New bus company registration: ' || NEW.company_name,
            jsonb_build_object(
                'message', 'New bus company registration: ' || NEW.company_name,
                'company_id', NEW.id,
                'company_name', NEW.company_name,
                'email', NEW.email,
                'phone', NEW.phone,
                'status', NEW.status
            ),
            admin_id
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_bus_company_registration
    AFTER INSERT ON bus_companies
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_of_registration();

-- Update existing notifications to have content if they don't already
UPDATE notifications 
SET content = jsonb_build_object(
    'message', COALESCE(message, ''),
    'data', data
)
WHERE content IS NULL; 