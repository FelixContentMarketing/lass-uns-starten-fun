-- ============================================
-- FIX: assigned_to Field Constraint Issue
-- ============================================
-- This script fixes the 409 Conflict error when creating tasks
-- by changing the assigned_to field to accept GoHighLevel User IDs
-- instead of Supabase Auth User IDs.
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/hdcjpcdnxyzkodpsoapf/editor
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
--
-- ============================================

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

-- Step 5: Create an index on the assigned_to field for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);

-- ============================================
-- Verification Query
-- ============================================
-- Run this after the migration to verify the changes:
-- 
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'tasks' 
--   AND column_name = 'assigned_to';
--
-- Expected result:
-- column_name: assigned_to
-- data_type: text
-- is_nullable: YES
-- ============================================

