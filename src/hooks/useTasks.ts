import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Task } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erfolgreich erstellt');
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen der Aufgabe: ' + error.message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      newStatus 
    }: { 
      id: number; 
      newStatus: Task['status'];
    }) => {
      // Get current task to log status history
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('status')
        .eq('id', id)
        .single();

      // Update task status
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log status change in history
      if (currentTask) {
        await supabase.from('task_status_history').insert([{
          task_id: id,
          old_status: currentTask.status,
          new_status: newStatus,
        }]);
      }

      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Status aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Statuswechsel: ' + error.message);
    },
  });
}

