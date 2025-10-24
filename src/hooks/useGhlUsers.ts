import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { syncGhlUsers } from '@/lib/ghl-api';
import { toast } from 'sonner';

export function useGhlUsers() {
  return useQuery({
    queryKey: ['ghl-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ghl_users')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useSyncGhlUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await syncGhlUsers();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-users'] });
      toast.success('Benutzer erfolgreich synchronisiert');
    },
    onError: (error: any) => {
      toast.error('Fehler beim Synchronisieren: ' + error.message);
    },
  });
}
