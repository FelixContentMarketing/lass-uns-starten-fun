-- Fix assigned_to field to allow GHL user IDs instead of Supabase auth user IDs
-- This migration changes the assigned_to field to reference ghl_users table

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

-- Step 2: Change the assigned_to column to TEXT to store GHL user IDs
ALTER TABLE public.tasks 
ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;

-- Step 3: Add a new foreign key constraint to ghl_users table
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assigned_to_ghl_user_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.ghl_users(ghl_user_id) ON DELETE SET NULL;

-- Step 4: Update the RLS policy to work with the new structure
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON public.tasks;

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.has_role(auth.uid(), 'admin')
  );

-- Note: We removed the assigned_to check from the policy since it now references GHL users
-- instead of Supabase auth users. Only creators and admins can update tasks.
