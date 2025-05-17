-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  device_id VARCHAR(255) NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_device_id ON sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY sessions_admin_policy ON sessions
  FOR ALL
  TO admin
  USING (true);

-- Users can only view and manage their own sessions
CREATE POLICY sessions_user_policy ON sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for session statistics
CREATE OR REPLACE VIEW session_stats AS
SELECT
  DATE_TRUNC('day', created_at) as session_date,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN is_active THEN 1 END) as active_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT device_id) as unique_devices
FROM sessions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY session_date DESC;

-- Create view for suspicious sessions
CREATE OR REPLACE VIEW suspicious_sessions AS
SELECT
  s.*,
  COUNT(*) OVER (PARTITION BY s.ip_address) as ip_count,
  COUNT(*) OVER (PARTITION BY s.device_id) as device_count
FROM sessions s
WHERE s.is_active = true
  AND (
    -- Multiple sessions from same IP
    COUNT(*) OVER (PARTITION BY s.ip_address) > 3
    OR
    -- Multiple sessions from same device
    COUNT(*) OVER (PARTITION BY s.device_id) > 1
  ); 