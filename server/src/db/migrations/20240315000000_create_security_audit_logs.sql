-- Create security audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id SERIAL PRIMARY KEY,
  audit_id UUID NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_tests INTEGER NOT NULL,
  passed_tests INTEGER NOT NULL,
  critical_findings INTEGER NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_audit_id ON security_audit_logs(audit_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp ON security_audit_logs(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_security_audit_logs_updated_at
  BEFORE UPDATE ON security_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY security_audit_logs_admin_policy ON security_audit_logs
  FOR ALL
  TO admin
  USING (true);

CREATE POLICY security_audit_logs_read_policy ON security_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create view for audit summary
CREATE OR REPLACE VIEW security_audit_summary AS
SELECT
  DATE_TRUNC('day', timestamp) as audit_date,
  COUNT(*) as total_audits,
  AVG(total_tests) as avg_tests,
  AVG(passed_tests::float / total_tests) as avg_pass_rate,
  SUM(critical_findings) as total_critical_findings
FROM security_audit_logs
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY audit_date DESC; 