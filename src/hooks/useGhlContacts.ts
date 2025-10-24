import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGhlContacts } from '@/lib/ghl-api';
import { toast } from 'sonner';

export function useGhlContacts() {
  return useQuery({
    queryKey: ['ghl-contacts'],
    queryFn: async () => {
      try {
        const contacts = await getGhlContacts();
        return contacts;
      } catch (error: any) {
        console.error('Error fetching GHL contacts:', error);
        toast.error('Fehler beim Laden der Kontakte: ' + error.message);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSyncGhlContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const contacts = await getGhlContacts();
      return contacts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-contacts'] });
      toast.success('Kontakte erfolgreich synchronisiert');
    },
    onError: (error: any) => {
      toast.error('Fehler beim Synchronisieren: ' + error.message);
    },
  });
}
