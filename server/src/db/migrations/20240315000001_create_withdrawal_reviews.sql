-- Create withdrawal reviews table
CREATE TABLE IF NOT EXISTS withdrawal_reviews (
  id UUID PRIMARY KEY,
  withdrawal_id UUID NOT NULL REFERENCES withdrawals(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(19,4) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_reviews_withdrawal_id ON withdrawal_reviews(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_reviews_user_id ON withdrawal_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_reviews_status ON withdrawal_reviews(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_reviews_created_at ON withdrawal_reviews(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_withdrawal_reviews_updated_at
  BEFORE UPDATE ON withdrawal_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE withdrawal_reviews ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY withdrawal_reviews_admin_policy ON withdrawal_reviews
  FOR ALL
  TO admin
  USING (true);

-- Users can only view their own reviews
CREATE POLICY withdrawal_reviews_user_policy ON withdrawal_reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for review statistics
CREATE OR REPLACE VIEW withdrawal_review_stats AS
SELECT
  DATE_TRUNC('day', created_at) as review_date,
  COUNT(*) as total_reviews,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600) as avg_review_time_hours
FROM withdrawal_reviews
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY review_date DESC; 