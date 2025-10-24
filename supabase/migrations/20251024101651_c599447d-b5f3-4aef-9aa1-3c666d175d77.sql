-- Create App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by_user_id UUID REFERENCES auth.users(id)
);

-- Create Task Status History Table (adjusted for UUID)
CREATE TABLE IF NOT EXISTS public.task_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  old_status task_status,
  new_status task_status NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  changed_by_user_id UUID REFERENCES auth.users(id)
);

-- Create Task Files Table (adjusted for UUID)
CREATE TABLE IF NOT EXISTS public.task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_key TEXT NOT NULL,
  filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  uploaded_by_user_id UUID REFERENCES auth.users(id)
);

-- Create GHL Users Table
CREATE TABLE IF NOT EXISTS public.ghl_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_user_id VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(320),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_users ENABLE ROW LEVEL SECURITY;

-- App Settings Policies
CREATE POLICY "Allow authenticated users to read app settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert/update app settings"
  ON public.app_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Task Status History Policies
CREATE POLICY "Allow authenticated users to read task status history"
  ON public.task_status_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert task status history"
  ON public.task_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Task Files Policies
CREATE POLICY "Allow authenticated users to read task files"
  ON public.task_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert task files"
  ON public.task_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete task files"
  ON public.task_files
  FOR DELETE
  TO authenticated
  USING (true);

-- GHL Users Policies
CREATE POLICY "Allow authenticated users to read ghl users"
  ON public.ghl_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert/update ghl users"
  ON public.ghl_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON public.task_status_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON public.task_files(task_id);
CREATE INDEX IF NOT EXISTS idx_ghl_users_ghl_user_id ON public.ghl_users(ghl_user_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);