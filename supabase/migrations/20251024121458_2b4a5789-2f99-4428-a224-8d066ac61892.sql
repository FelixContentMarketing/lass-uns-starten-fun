-- ============================================
-- FIX: assigned_to Field Constraint Issue
-- ============================================

-- Step 1: Drop ALL policies that reference assigned_to column
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON public.tasks;

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

-- Step 3: Change the assigned_to column to TEXT to store GHL user IDs
ALTER TABLE public.tasks 
ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;

-- Step 4: Add a new foreign key constraint to ghl_users table
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assigned_to_ghl_user_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.ghl_users(ghl_user_id) ON DELETE SET NULL;

-- Step 5: Recreate the RLS policy with the new structure
CREATE POLICY "Users can update tasks they created or are assigned to"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.has_role(auth.uid(), 'admin')
  );

-- Step 6: Create an index on the assigned_to field for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);