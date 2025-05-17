-- Create audit_logs table with partitioning
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) NOT NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for current and next month
CREATE TABLE IF NOT EXISTS audit_logs_current PARTITION OF audit_logs
  FOR VALUES FROM (DATE_TRUNC('month', CURRENT_DATE))
  TO (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'));

CREATE TABLE IF NOT EXISTS audit_logs_next PARTITION OF audit_logs
  FOR VALUES FROM (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
  TO (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 months'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_users_policy ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY audit_logs_admins_policy ON audit_logs
  FOR ALL
  TO admin
  USING (true);

-- Create function to create new partitions
CREATE OR REPLACE FUNCTION create_audit_logs_partition()
RETURNS void AS $$
DECLARE
  partition_name TEXT;
  partition_start DATE;
  partition_end DATE;
BEGIN
  partition_start := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 months');
  partition_end := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '3 months');
  partition_name := 'audit_logs_' || TO_CHAR(partition_start, 'YYYY_MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs
     FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    partition_start,
    partition_end
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to drop old partitions
CREATE OR REPLACE FUNCTION drop_old_audit_logs_partitions(months_to_keep INTEGER)
RETURNS void AS $$
DECLARE
  partition_name TEXT;
  partition_date DATE;
BEGIN
  FOR partition_name IN
    SELECT tablename
    FROM pg_tables
    WHERE tablename LIKE 'audit_logs_%'
    AND tablename != 'audit_logs_current'
    AND tablename != 'audit_logs_next'
  LOOP
    partition_date := TO_DATE(SUBSTRING(partition_name FROM 'audit_logs_(\d{4}_\d{2})'), 'YYYY_MM');
    
    IF partition_date < DATE_TRUNC('month', CURRENT_DATE - (months_to_keep || ' months')::INTERVAL) THEN
      EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to maintain partitions
CREATE OR REPLACE FUNCTION maintain_audit_logs_partitions()
RETURNS void AS $$
BEGIN
  -- Create new partition
  PERFORM create_audit_logs_partition();
  
  -- Drop old partitions (keep 12 months)
  PERFORM drop_old_audit_logs_partitions(12);
END;
$$ LANGUAGE plpgsql; 