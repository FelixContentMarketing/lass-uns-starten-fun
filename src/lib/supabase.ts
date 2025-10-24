import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type Task = {
  id: string; // UUID in Supabase
  ghl_task_id?: string;
  ghl_contact_id?: string;
  title: string;
  description?: string;
  status: 'posteingang' | 'in_freigabe' | 'in_bearbeitung' | 'erledigt';
  priority?: 'niedrig' | 'mittel' | 'hoch' | 'dringend';
  due_date?: string;
  assigned_to?: string; // GHL User ID (references ghl_users.ghl_user_id)
  created_by: string; // Supabase Auth User ID (UUID)
  created_at: string;
  updated_at: string;
};

export type TaskStatusHistory = {
  id: string; // UUID
  task_id: string; // UUID reference to tasks.id
  old_status?: 'posteingang' | 'in_freigabe' | 'in_bearbeitung' | 'erledigt';
  new_status: 'posteingang' | 'in_freigabe' | 'in_bearbeitung' | 'erledigt';
  changed_at: string;
  changed_by: string; // Supabase Auth User ID (UUID)
};

export type TaskFile = {
  id: string; // UUID
  task_id: string; // UUID reference to tasks.id
  file_url: string;
  file_key: string;
  filename: string;
  mime_type?: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by: string; // Supabase Auth User ID (UUID)
};

export type GhlUser = {
  id: number;
  ghl_user_id: string;
  name?: string;
  email?: string;
  last_synced_at: string;
};

export type AppSetting = {
  id: number; // BIGSERIAL in app_settings table
  key: string;
  value?: string;
  description?: string;
  updated_at: string;
  updated_by_user_id?: string; // Supabase Auth User ID (UUID)
};

