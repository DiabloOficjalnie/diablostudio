-- Create user_guide_progress table for storing user progress in guides and courses
CREATE TABLE IF NOT EXISTS user_guide_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guide_id TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_results JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one progress record per user per guide
    UNIQUE(user_id, guide_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_guide_progress_user_id ON user_guide_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_guide_progress_guide_id ON user_guide_progress(guide_id);
CREATE INDEX IF NOT EXISTS idx_user_guide_progress_completed ON user_guide_progress(completed);

-- Enable RLS (Row Level Security)
ALTER TABLE user_guide_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress" ON user_guide_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_guide_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_guide_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON user_guide_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_guide_progress_updated_at
    BEFORE UPDATE ON user_guide_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
-- Note: Replace 'user-id-here' with actual user ID from auth.users table
-- INSERT INTO user_guide_progress (user_id, guide_id, current_step, completed, quiz_results)
-- VALUES
--     ('user-id-here', 'floor-preparation', 2, false, '{"surface-assessment": {"passed": true, "score": 100}}'),
--     ('user-id-here', 'safety-instructions', 5, true, '{"protective-equipment": {"passed": true, "score": 100}}')
-- ON CONFLICT (user_id, guide_id) DO UPDATE SET
--     current_step = EXCLUDED.current_step,
--     completed = EXCLUDED.completed,
--     quiz_results = EXCLUDED.quiz_results,
--     updated_at = NOW();

SELECT 'User guide progress table created successfully!' as status;
