-- Create settings table (singleton)
CREATE TABLE public.settings (
    id smallint PRIMARY KEY CHECK (id = 1),
    ai_enabled boolean NOT NULL DEFAULT true,
    interval_minutes smallint NOT NULL DEFAULT 15,
    overbooking_enabled boolean NOT NULL DEFAULT false,
    waitlist_enabled boolean NOT NULL DEFAULT true
);

-- Initialize the single settings row
INSERT INTO public.settings (id) VALUES (1);

-- Create clients table
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create appointments table
CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    service_name text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    duration_minutes smallint NOT NULL DEFAULT 60,
    status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.settings FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.appointments FOR DELETE USING (true);
