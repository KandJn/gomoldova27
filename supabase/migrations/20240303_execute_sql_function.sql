-- Drop the existing function first
DROP FUNCTION IF EXISTS public.execute_sql(text);

-- Create the execute_sql function
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to execute this function
GRANT EXECUTE ON FUNCTION public.execute_sql TO anon, authenticated, service_role; 