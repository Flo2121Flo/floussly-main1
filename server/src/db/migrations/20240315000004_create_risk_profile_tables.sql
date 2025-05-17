-- Create risk profiles table
CREATE TABLE IF NOT EXISTS risk_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  risk_level VARCHAR(20) NOT NULL,
  risk_score DECIMAL(4,3) NOT NULL,
  factors JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 1)
);

-- Create risk profile history table
CREATE TABLE IF NOT EXISTS risk_profile_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  risk_level VARCHAR(20) NOT NULL,
  risk_score DECIMAL(4,3) NOT NULL,
  factors JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 1)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_risk_profiles_user_id ON risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_risk_level ON risk_profiles(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_risk_score ON risk_profiles(risk_score);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_created_at ON risk_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_profile_history_user_id ON risk_profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_profile_history_created_at ON risk_profile_history(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_risk_profiles_updated_at
  BEFORE UPDATE ON risk_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profile_history ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY risk_profiles_admin_policy ON risk_profiles
  FOR ALL
  TO admin
  USING (true);

CREATE POLICY risk_profile_history_admin_policy ON risk_profile_history
  FOR ALL
  TO admin
  USING (true);

-- Users can only view their own risk profiles
CREATE POLICY risk_profiles_user_policy ON risk_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY risk_profile_history_user_policy ON risk_profile_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for risk statistics
CREATE OR REPLACE VIEW risk_stats AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  risk_level,
  COUNT(*) as user_count,
  AVG(risk_score) as avg_risk_score,
  COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_count,
  COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_count,
  COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_count
FROM risk_profiles
GROUP BY DATE_TRUNC('day', created_at), risk_level
ORDER BY date DESC, risk_level;

-- Create view for user risk trends
CREATE OR REPLACE VIEW user_risk_trends AS
SELECT
  user_id,
  DATE_TRUNC('day', created_at) as date,
  risk_level,
  risk_score,
  LAG(risk_score) OVER (PARTITION BY user_id ORDER BY created_at) as previous_score,
  LAG(risk_level) OVER (PARTITION BY user_id ORDER BY created_at) as previous_level
FROM risk_profile_history
ORDER BY user_id, date DESC; 