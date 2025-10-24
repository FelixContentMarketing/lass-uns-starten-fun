-- Make assigned_to nullable and drop the foreign key constraint to allow tasks without assigned users
ALTER TABLE public.tasks 
ALTER COLUMN assigned_to DROP NOT NULL;

-- Drop the foreign key constraint
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_assigned_to_ghl_user_fkey;

-- Add comment explaining the change
COMMENT ON COLUMN public.tasks.assigned_to IS 'GHL User ID - nullable to allow tasks without assignment';