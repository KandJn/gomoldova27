-- Create a function to insert a test bus company
CREATE OR REPLACE FUNCTION public.create_test_bus_company(
  p_company_name TEXT,
  p_email TEXT,
  p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert the test company
  INSERT INTO public.bus_companies (
    company_name,
    email,
    phone,
    status
  ) VALUES (
    p_company_name,
    p_email,
    p_phone,
    'pending'
  )
  RETURNING to_jsonb(bus_companies.*) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating test company: %', SQLERRM;
END;
$$; 