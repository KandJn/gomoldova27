-- Create a function to reload the schema cache
CREATE OR REPLACE FUNCTION public.reload_types()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a no-op function that forces the client to refresh its schema cache
  -- when called. The actual implementation doesn't need to do anything.
  RETURN;
END;
$$; 