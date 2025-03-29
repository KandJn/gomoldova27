-- Fix the execute_sql function to properly handle the bus_companies table
CREATE OR REPLACE FUNCTION public.execute_sql(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Log the SQL being executed for debugging
  RAISE NOTICE 'Executing SQL: %', sql;
  
  -- Execute the SQL and capture the result
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Error executing SQL: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    
    -- If the error is about column_name not existing, try with a different approach
    IF SQLSTATE = '42703' AND SQLERRM LIKE '%column%company_name%does not exist%' THEN
      -- Get the actual column names from the table
      DECLARE
        columns_json JSONB;
      BEGIN
        EXECUTE 'SELECT json_object_agg(column_name, data_type) FROM information_schema.columns WHERE table_name = ''bus_companies''' INTO columns_json;
        RAISE NOTICE 'Available columns: %', columns_json;
        
        -- Return the error with helpful information
        RETURN jsonb_build_object(
          'error', SQLERRM,
          'available_columns', columns_json
        );
      END;
    ELSE
      -- For other errors, just return the error message
      RETURN jsonb_build_object('error', SQLERRM);
    END IF;
END;
$$; 