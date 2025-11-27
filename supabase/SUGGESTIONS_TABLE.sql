-- Create the suggestions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (anyone can suggest)
CREATE POLICY "Allow anonymous suggestions" ON public.suggestions
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow admins to view suggestions (assuming admin role or similar logic, 
-- but for now let's allow read for authenticated users or just public read if needed. 
-- Usually admins are authenticated. Let's allow authenticated users to read.)
CREATE POLICY "Allow authenticated to view suggestions" ON public.suggestions
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant permissions
GRANT ALL ON TABLE public.suggestions TO postgres;
GRANT ALL ON TABLE public.suggestions TO service_role;
GRANT INSERT ON TABLE public.suggestions TO anon;
GRANT INSERT ON TABLE public.suggestions TO authenticated;
GRANT SELECT ON TABLE public.suggestions TO authenticated;
