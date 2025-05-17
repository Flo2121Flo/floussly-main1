-- Create fraud rules table
CREATE TABLE IF NOT EXISTS fraud_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL,
  action VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_action CHECK (action IN ('allow', 'block', 'review', 'notify'))
);

-- Create fraud events table
CREATE TABLE IF NOT EXISTS fraud_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  evaluations JSONB NOT NULL,
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_action CHECK (action IN ('allow', 'block', 'review', 'notify'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fraud_rules_is_active ON fraud_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_severity ON fraud_rules(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_action ON fraud_rules(action);
CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON fraud_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_type ON fraud_events(type);
CREATE INDEX IF NOT EXISTS idx_fraud_events_action ON fraud_events(action);
CREATE INDEX IF NOT EXISTS idx_fraud_events_created_at ON fraud_events(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_fraud_rules_updated_at
  BEFORE UPDATE ON fraud_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_events ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY fraud_rules_admin_policy ON fraud_rules
  FOR ALL
  TO admin
  USING (true);

CREATE POLICY fraud_events_admin_policy ON fraud_events
  FOR ALL
  TO admin
  USING (true);

-- Users can only view their own fraud events
CREATE POLICY fraud_events_user_policy ON fraud_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for fraud statistics
CREATE OR REPLACE VIEW fraud_stats AS
SELECT
  DATE_TRUNC('day', created_at) as event_date,
  COUNT(*) as total_events,
  COUNT(CASE WHEN action = 'block' THEN 1 END) as blocked_count,
  COUNT(CASE WHEN action = 'review' THEN 1 END) as review_count,
  COUNT(CASE WHEN action = 'notify' THEN 1 END) as notify_count,
  COUNT(DISTINCT user_id) as affected_users
FROM fraud_events
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY event_date DESC;

-- Create view for user fraud risk
CREATE OR REPLACE VIEW user_fraud_risk AS
SELECT
  u.id as user_id,
  u.email,
  u.kyc_level,
  COUNT(fe.id) as total_fraud_events,
  COUNT(CASE WHEN fe.action = 'block' THEN 1 END) as blocked_events,
  COUNT(CASE WHEN fe.action = 'review' THEN 1 END) as review_events,
  MAX(fe.created_at) as last_fraud_event,
  CASE
    WHEN COUNT(fe.id) = 0 THEN 'low'
    WHEN COUNT(fe.id) < 3 THEN 'medium'
    WHEN COUNT(fe.id) < 5 THEN 'high'
    ELSE 'critical'
  END as risk_level
FROM users u
LEFT JOIN fraud_events fe ON fe.user_id = u.id
GROUP BY u.id, u.email, u.kyc_level;

-- Insert some default rules
INSERT INTO fraud_rules (id, name, description, conditions, severity, action)
VALUES
  (
    gen_random_uuid(),
    'High Value Transaction',
    'Flag transactions above threshold for review',
    '[
      {
        "field": "amount",
        "operator": "gt",
        "value": 1000
      }
    ]'::jsonb,
    'medium',
    'review'
  ),
  (
    gen_random_uuid(),
    'Multiple Failed Logins',
    'Block account after multiple failed login attempts',
    '[
      {
        "field": "failed_attempts",
        "operator": "gte",
        "value": 5,
        "aggregation": "count",
        "timeWindow": 300
      }
    ]'::jsonb,
    'high',
    'block'
  ),
  (
    gen_random_uuid(),
    'Unusual Location',
    'Review transactions from new locations',
    '[
      {
        "field": "is_new_location",
        "operator": "eq",
        "value": true
      }
    ]'::jsonb,
    'medium',
    'review'
  ),
  (
    gen_random_uuid(),
    'Rapid Transactions',
    'Flag multiple transactions in short time',
    '[
      {
        "field": "transaction_count",
        "operator": "gt",
        "value": 3,
        "aggregation": "count",
        "timeWindow": 60
      }
    ]'::jsonb,
    'high',
    'review'
  ),
  (
    gen_random_uuid(),
    'Large Volume Increase',
    'Review sudden increase in transaction volume',
    '[
      {
        "field": "volume_increase",
        "operator": "gt",
        "value": 200,
        "aggregation": "avg",
        "timeWindow": 3600
      }
    ]'::jsonb,
    'high',
    'review'
  ); 