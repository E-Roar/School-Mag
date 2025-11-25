-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_name TEXT NOT NULL DEFAULT 'E-Roar Magazine',
    school_logo_url TEXT,
    school_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row if not exists
INSERT INTO public.settings (school_name, school_description)
SELECT 'E-Roar Magazine', 'A Digital Magazine Platform'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies for settings
CREATE POLICY "Public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin update access to settings"
ON public.settings FOR UPDATE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for logs
CREATE POLICY "Admin read access to logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

CREATE POLICY "Authenticated insert logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);
