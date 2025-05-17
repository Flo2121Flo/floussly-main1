-- Create onboarding checklist table
CREATE TABLE onboarding_checklist (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL,
  data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  CONSTRAINT valid_type CHECK (type IN ('kyc', 'bank_account', 'identity_verification', 'phone_verification', 'email_verification', 'security_setup', 'preferences'))
);

-- Create indexes
CREATE INDEX idx_onboarding_checklist_user_id ON onboarding_checklist(user_id);
CREATE INDEX idx_onboarding_checklist_status ON onboarding_checklist(status);
CREATE INDEX idx_onboarding_checklist_type ON onboarding_checklist(type);
CREATE INDEX idx_onboarding_checklist_order ON onboarding_checklist("order");
CREATE INDEX idx_onboarding_checklist_completed_at ON onboarding_checklist(completed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_onboarding_checklist_updated_at
  BEFORE UPDATE ON onboarding_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE onboarding_checklist ENABLE ROW LEVEL SECURITY;

-- Admin policy
CREATE POLICY admin_all_onboarding_checklist ON onboarding_checklist
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

-- User policy (users can only view their own checklist items)
CREATE POLICY user_select_onboarding_checklist ON onboarding_checklist
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for onboarding statistics
CREATE VIEW onboarding_stats AS
SELECT
  user_id,
  COUNT(*) as total_items,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_items,
  COUNT(CASE WHEN required THEN 1 END) as required_items,
  COUNT(CASE WHEN required AND status = 'completed' THEN 1 END) as completed_required_items,
  ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)::float) * 100) as completion_percentage,
  MAX(updated_at) as last_updated
FROM onboarding_checklist
GROUP BY user_id;

-- Create view for onboarding trends
CREATE VIEW onboarding_trends AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(DISTINCT user_id) as new_users,
  COUNT(DISTINCT CASE WHEN status = 'completed' THEN user_id END) as completed_users,
  COUNT(*) as total_items,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_items
FROM onboarding_checklist
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Add onboarding_completed column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$; 