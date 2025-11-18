-- Create conversation_transcripts table for storing call transcripts
CREATE TABLE IF NOT EXISTS conversation_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('ai_bot', 'client', 'system')),
  message_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sequence_number INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_call_session 
  ON conversation_transcripts(call_session_id);

CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_created_at 
  ON conversation_transcripts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_sequence 
  ON conversation_transcripts(call_session_id, sequence_number);

-- Enable Row Level Security (RLS)
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow advisors to read all transcripts
CREATE POLICY "Advisors can read all transcripts"
  ON conversation_transcripts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'advisor'
    )
  );

-- Allow clients to read their own call transcripts
CREATE POLICY "Clients can read their own transcripts"
  ON conversation_transcripts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE call_sessions.id = conversation_transcripts.call_session_id
      AND call_sessions.client_id = auth.uid()
    )
  );

-- Allow backend to insert transcripts (use service_role key)
CREATE POLICY "Service role can insert transcripts"
  ON conversation_transcripts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow backend to update transcripts (use service_role key)
CREATE POLICY "Service role can update transcripts"
  ON conversation_transcripts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversation_transcripts_updated_at
  BEFORE UPDATE ON conversation_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_transcripts_updated_at();
