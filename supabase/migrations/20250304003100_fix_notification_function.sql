-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_bus_company_registration ON bus_companies;
DROP FUNCTION IF EXISTS notify_admins_of_registration();

-- Create updated notification function
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