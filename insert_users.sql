-- Insert GoHighLevel Users
-- Diese SQL-Befehle in Supabase SQL Editor ausführen

INSERT INTO public.ghl_users (ghl_user_id, name, email, last_synced_at)
VALUES 
  ('0eEdii6BpBgwo0mSlQ94', 'Christiane Brandt', 'christiane.brandt95@web.de', NOW()),
  ('Kzj3WixN9NaFY9b0RtGN', 'Felix Schmidt', 'hallo@felix-content-marketing.de', NOW())
ON CONFLICT (ghl_user_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  last_synced_at = EXCLUDED.last_synced_at;

