-- Function to disable foreign key constraints
CREATE OR REPLACE FUNCTION disable_foreign_keys() RETURNS void AS $$
BEGIN
  SET session_replication_role = 'replica';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable foreign key constraints
CREATE OR REPLACE FUNCTION enable_foreign_keys() RETURNS void AS $$
BEGIN
  SET session_replication_role = 'origin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 