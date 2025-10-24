import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Save, Key, MapPin } from "lucide-react";

const Settings = () => {
  const [ghlApiToken, setGhlApiToken] = useState("");
  const [ghlLocationId, setGhlLocationId] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .in('key', ['ghl_api_token', 'ghl_location_id', 'openai_api_key']);

      settings?.forEach((setting) => {
        if (setting.key === 'ghl_api_token') {
          setGhlApiToken(setting.value || '');
        } else if (setting.key === 'ghl_location_id') {
          setGhlLocationId(setting.value || '');
        } else if (setting.key === 'openai_api_key') {
          setOpenaiApiKey(setting.value || '');
        }
      });
    } catch (error: any) {
      toast.error('Fehler beim Laden der Einstellungen: ' + error.message);
    }
  };

  const saveSetting = async (key: string, value: string, description: string) => {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value,
        description,
      }, {
        onConflict: 'key',
      });

    if (error) throw error;
  };

  const handleSaveGhlSettings = async () => {
    setLoading(true);
    try {
      await saveSetting('ghl_api_token', ghlApiToken, 'GoHighLevel Private Integration Token');
      await saveSetting('ghl_location_id', ghlLocationId, 'GoHighLevel Location ID');
      toast.success('GoHighLevel-Einstellungen gespeichert');
    } catch (error: any) {
      toast.error('Fehler beim Speichern: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOpenAiSettings = async () => {
    setLoading(true);
    try {
      await saveSetting('openai_api_key', openaiApiKey, 'OpenAI API Key für KI-Textanalyse');
      toast.success('OpenAI-Einstellungen gespeichert');
    } catch (error: any) {
      toast.error('Fehler beim Speichern: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
          <p className="text-muted-foreground">
            Konfiguriere die Integrationen und API-Zugänge
          </p>
        </div>

        <Tabs defaultValue="ghl" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ghl">GoHighLevel</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
          </TabsList>

          <TabsContent value="ghl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  GoHighLevel Integration
                </CardTitle>
                <CardDescription>
                  Verbinde dein GoHighLevel-Konto für die Zwei-Wege-Synchronisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ghl-token">Private Integration Token</Label>
                  <Input
                    id="ghl-token"
                    type="password"
                    placeholder="pit-a8a4c124-0462-42fc-b842-..."
                    value={ghlApiToken}
                    onChange={(e) => setGhlApiToken(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Erstelle einen Token in deinem GoHighLevel Account unter Settings → Integrations → Private Integration
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ghl-location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location ID
                  </Label>
                  <Input
                    id="ghl-location"
                    placeholder="0Ys1u4Ikk9cw1egXXXXX"
                    value={ghlLocationId}
                    onChange={(e) => setGhlLocationId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Findest du in der URL deiner GoHighLevel Location
                  </p>
                </div>

                <Button onClick={handleSaveGhlSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  OpenAI API
                </CardTitle>
                <CardDescription>
                  Aktiviere die KI-gestützte E-Mail-Analyse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Erstelle einen API Key auf{" "}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      platform.openai.com
                    </a>
                  </p>
                </div>

                <Button onClick={handleSaveOpenAiSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

