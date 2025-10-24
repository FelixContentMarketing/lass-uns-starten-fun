import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { syncGhlUsers } from "@/lib/ghl-api";
import { toast } from "sonner";
import { RefreshCw, Users as UsersIcon } from "lucide-react";
import { useState } from "react";

const Team = () => {
  const [syncing, setSyncing] = useState(false);

  const { data: ghlUsers, isLoading, refetch } = useQuery({
    queryKey: ['ghl-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ghl_users')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncGhlUsers();
      await refetch();
      toast.success('Benutzer erfolgreich synchronisiert');
    } catch (error: any) {
      toast.error('Fehler bei der Synchronisation: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">
              GoHighLevel Benutzer verwalten und synchronisieren
            </p>
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Synchronisieren
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              GoHighLevel Benutzer
            </CardTitle>
            <CardDescription>
              Benutzer aus deiner GoHighLevel Location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Lade Benutzer...</p>
            ) : !ghlUsers || ghlUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Noch keine Benutzer synchronisiert
                </p>
                <Button onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Jetzt synchronisieren
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {ghlUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{user.name || 'Unbekannt'}</p>
                      <p className="text-sm text-muted-foreground">{user.email || 'Keine E-Mail'}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Zuletzt synchronisiert: {new Date(user.last_synced_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Team;

