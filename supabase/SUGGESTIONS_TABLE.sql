-- Create suggestions table for anonymous feedback
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived'))
);

-- Enable RLS
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (anon) to insert suggestions
CREATE POLICY "Allow public to submit suggestions" 
ON public.suggestions FOR INSERT 
TO public, anon 
WITH CHECK (true);

-- Policy: Allow admins to view suggestions
-- Assuming admin check is done via app logic or a specific role, 
-- but for now let's allow authenticated users (if admins are auth'd) or just public read if we want transparency (probably not).
-- Let's stick to a basic policy where authenticated users can read (assuming only admins log in).
CREATE POLICY "Allow authenticated users to view suggestions" 
ON public.suggestions FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Allow authenticated users to update/delete (manage) suggestions
CREATE POLICY "Allow authenticated users to manage suggestions" 
ON public.suggestions FOR ALL 
TO authenticated 
USING (true);
