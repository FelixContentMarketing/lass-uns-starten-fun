import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type Task = {
  id: number;
  ghl_task_id?: string;
  title: string;
  description?: string;
  status: 'posteingang' | 'in_freigabe' | 'in_bearbeitung' | 'erledigt';
  priority?: 'niedrig' | 'mittel' | 'hoch' | 'dringend';
  due_date?: string;
  assigned_to_user_id?: number;
  assigned_to_ghl_user_id?: string;
  contact_id?: string;
  created_by_user_id?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};

export type TaskStatusHistory = {
  id: number;
  task_id: number;
  old_status?: 'posteingang' | 'in_freigabe' | 'in_bearbeitung' | 'erledigt';
  new_status: 'posteingang' | 'in_freigabe' | 'in_bearbeitung' | 'erledigt';
  changed_at: string;
  changed_by_user_id?: number;
};

export type TaskFile = {
  id: number;
  task_id: number;
  file_url: string;
  file_key: string;
  filename: string;
  mime_type?: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by_user_id?: number;
};

export type GhlUser = {
  id: number;
  ghl_user_id: string;
  name?: string;
  email?: string;
  last_synced_at: string;
};

export type AppSetting = {
  id: number;
  key: string;
  value?: string;
  description?: string;
  updated_at: string;
  updated_by_user_id?: number;
};

