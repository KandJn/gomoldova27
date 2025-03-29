-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_bus_company_registration ON bus_companies;

-- Drop existing function
DROP FUNCTION IF EXISTS notify_admins_of_registration();

-- Add content column to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS content JSONB;

-- Migrate existing data from message and data columns to content
UPDATE notifications 
SET content = jsonb_build_object(
    'message', COALESCE(message, ''),
    'data', data
)
WHERE content IS NULL;

-- Create or replace function for notification creation to use content field
CREATE OR REPLACE FUNCTION notify_admins_of_registration()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (type, content, user_id, message)
    SELECT 
        'NEW_BUS_COMPANY_REGISTRATION',
        jsonb_build_object(
            'message', 'New bus company registration: ' || NEW.company_name,
            'company_id', NEW.id,
            'company_name', NEW.company_name
        ),
        user_id,
        'New bus company registration: ' || NEW.company_name
    FROM get_admin_user_ids();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_bus_company_registration
    AFTER INSERT ON bus_companies
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_of_registration();
