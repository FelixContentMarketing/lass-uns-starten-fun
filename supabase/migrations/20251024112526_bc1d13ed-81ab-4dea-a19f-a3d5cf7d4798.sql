-- Add ghl_task_id column to tasks table for GoHighLevel synchronization
ALTER TABLE public.tasks 
ADD COLUMN ghl_task_id TEXT UNIQUE;

-- Add ghl_contact_id column to store the associated contact
ALTER TABLE public.tasks 
ADD COLUMN ghl_contact_id TEXT;

-- Create index for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_tasks_ghl_task_id ON public.tasks(ghl_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ghl_contact_id ON public.tasks(ghl_contact_id);

-- Add comment for documentation
COMMENT ON COLUMN public.tasks.ghl_task_id IS 'GoHighLevel task ID for synchronization';
COMMENT ON COLUMN public.tasks.ghl_contact_id IS 'GoHighLevel contact ID associated with this task';