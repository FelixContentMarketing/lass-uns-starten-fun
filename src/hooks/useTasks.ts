import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Task } from '@/lib/supabase';
import { toast } from 'sonner';
import { createGhlTask, updateGhlTask, deleteGhlTask } from '@/lib/ghl-api';

// Mapping deutsche zu englische Werte
const priorityMap = {
  'niedrig': 'low',
  'mittel': 'medium',
  'hoch': 'high',
  'dringend': 'urgent'
} as const;

const statusMap = {
  'posteingang': 'inbox',
  'in_freigabe': 'in_approval',
  'in_bearbeitung': 'in_progress',
  'erledigt': 'done'
} as const;

const reversePriorityMap = {
  'low': 'niedrig',
  'medium': 'mittel',
  'high': 'hoch',
  'urgent': 'dringend'
} as const;

const reverseStatusMap = {
  'inbox': 'posteingang',
  'in_approval': 'in_freigabe',
  'in_progress': 'in_bearbeitung',
  'done': 'erledigt'
} as const;

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Konvertiere englische Werte zurück zu deutschen
      return (data || []).map(task => ({
        ...task,
        priority: reversePriorityMap[task.priority as keyof typeof reversePriorityMap] || task.priority,
        status: reverseStatusMap[task.status as keyof typeof reverseStatusMap] || task.status,
      })) as Task[];
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      // Konvertiere deutsche Werte zu englischen für die Datenbank
      const dbTask = {
        ...task,
        priority: task.priority ? priorityMap[task.priority as keyof typeof priorityMap] : 'medium',
        status: task.status ? statusMap[task.status as keyof typeof statusMap] : 'inbox',
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([dbTask])
        .select()
        .single();

      if (error) throw error;
      
      // Synchronize to GoHighLevel (only if contactId is provided)
      if (data.ghl_contact_id) {
        try {
          const ghlTask = await createGhlTask({
            title: data.title,
            contactId: data.ghl_contact_id,
            body: data.description || undefined,
            dueDate: data.due_date || undefined,
            assignedTo: data.assigned_to || undefined,
          });
          
          // Update local task with GHL task ID
          if (ghlTask?.task?.id) {
            await supabase
              .from('tasks')
              .update({ ghl_task_id: ghlTask.task.id })
              .eq('id', data.id);
          }
          
          toast.success('Aufgabe erstellt und zu GoHighLevel synchronisiert');
        } catch (ghlError: any) {
          console.error('GoHighLevel sync error:', ghlError);
          toast.warning('Aufgabe erstellt, aber nicht zu GoHighLevel synchronisiert: ' + ghlError.message);
        }
      } else {
        toast.info('Aufgabe erstellt (ohne GHL-Synchronisation - kein Kontakt ausgewählt)');
      }
      
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen der Aufgabe: ' + error.message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      // Konvertiere deutsche Werte zu englischen für die Datenbank
      const dbUpdates = {
        ...updates,
        priority: updates.priority ? priorityMap[updates.priority as keyof typeof priorityMap] : updates.priority,
        status: updates.status ? statusMap[updates.status as keyof typeof statusMap] : updates.status,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Synchronize to GoHighLevel if task has ghl_task_id and ghl_contact_id
      if (data.ghl_task_id && data.ghl_contact_id) {
        try {
          await updateGhlTask(data.ghl_task_id, data.ghl_contact_id, {
            title: data.title,
            body: data.description || undefined,
            dueDate: data.due_date || undefined,
            assignedTo: data.assigned_to || undefined,
            completed: data.status === 'done',
          });
        } catch (ghlError: any) {
          console.error('GoHighLevel sync error:', ghlError);
          toast.warning('Aufgabe aktualisiert, aber nicht zu GoHighLevel synchronisiert');
        }
      }
      
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
    mutationFn: async (id: string) => {
      // Get task to check if it has ghl_task_id and ghl_contact_id
      const { data: task } = await supabase
        .from('tasks')
        .select('ghl_task_id, ghl_contact_id')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Delete from GoHighLevel if task has ghl_task_id and ghl_contact_id
      if (task?.ghl_task_id && task?.ghl_contact_id) {
        try {
          await deleteGhlTask(task.ghl_task_id, task.ghl_contact_id);
        } catch (ghlError: any) {
          console.error('GoHighLevel delete error:', ghlError);
          toast.warning('Aufgabe gelöscht, aber nicht aus GoHighLevel entfernt');
        }
      }
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
      id: string; 
      newStatus: Task['status'];
    }) => {
      // Konvertiere deutschen Status zu englischem für die Datenbank
      const dbStatus = statusMap[newStatus as keyof typeof statusMap];
      
      // Get current task to log status history and check for ghl_task_id
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('status, ghl_task_id, ghl_contact_id')
        .eq('id', id)
        .single();

      // Update task status
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log status change in history
      if (currentTask) {
        await supabase.from('task_status_history').insert([{
          task_id: id,
          old_status: currentTask.status,
          new_status: dbStatus,
        }]);
        
        // Synchronize status to GoHighLevel
        if (currentTask.ghl_task_id && currentTask.ghl_contact_id) {
          try {
            await updateGhlTask(currentTask.ghl_task_id, currentTask.ghl_contact_id, {
              completed: dbStatus === 'done',
            });
          } catch (ghlError: any) {
            console.error('GoHighLevel sync error:', ghlError);
            toast.warning('Status aktualisiert, aber nicht zu GoHighLevel synchronisiert');
          }
        }
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

