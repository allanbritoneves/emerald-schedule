-- Add user_id to clients table
ALTER TABLE public.clients ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Update RLS policies for clients to be more restrictive
-- In a real scenario, we would distinguish between Admins and Clients.
-- For this MVP, we will allow users to manage their own records.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.clients;

-- Admins (for now, everyone authenticated) can see everything, or we can use specific UID.
-- Let's allow authenticated users to see their own data, and service role to see everything.
CREATE POLICY "Users can view their own client profile" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own client profile" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client profile" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Support for current anon access if needed (for initial testing/admin)
CREATE POLICY "Allow anon select for now" ON public.clients FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert for now" ON public.clients FOR INSERT TO anon WITH CHECK (true);

-- Update appointments RLS as well
DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.appointments;

-- Users can only see their own appointments (via client link)
-- This works if client_id is linked to the user's client record.
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.clients 
        WHERE public.clients.id = public.appointments.client_id 
        AND public.clients.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.clients 
        WHERE public.clients.id = public.appointments.client_id 
        AND public.clients.user_id = auth.uid()
    )
);

-- Allow anon for now to not break the current app until login is fully ready
CREATE POLICY "Allow anon select for appts" ON public.appointments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert for appts" ON public.appointments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update for appts" ON public.appointments FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete for appts" ON public.appointments FOR DELETE TO anon USING (true);
