import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTask } from "@/hooks/useTasks";
import { useGhlUsers, useSyncGhlUsers } from "@/hooks/useGhlUsers";
import { Loader2, Sparkles, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"niedrig" | "mittel" | "hoch" | "dringend">("mittel");
  const [dueDate, setDueDate] = useState("");
  const [emailText, setEmailText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [assignedToGhlUserId, setAssignedToGhlUserId] = useState<string>("");
  const [ghlContactId, setGhlContactId] = useState<string>("");

  const createTask = useCreateTask();
  const { data: ghlUsers = [], isLoading: loadingUsers } = useGhlUsers();
  const syncUsers = useSyncGhlUsers();

  // Sync GHL users on first open
  useEffect(() => {
    if (open && ghlUsers.length === 0) {
      syncUsers.mutate();
    }
  }, [open]);

  const analyzeEmailWithAI = async () => {
    if (!emailText.trim()) {
      toast.error("Bitte E-Mail-Text eingeben");
      return;
    }

    setAnalyzing(true);
    try {
      // Get OpenAI API key from settings
      const { data: setting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'openai_api_key')
        .single();

      if (!setting?.value) {
        toast.error("OpenAI API Key nicht konfiguriert. Bitte in den Einstellungen hinterlegen.");
        return;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${setting.value}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Assistent, der E-Mails analysiert und strukturierte Aufgaben daraus erstellt. Extrahiere Titel, Beschreibung, Priorität (niedrig/mittel/hoch/dringend) und Fälligkeitsdatum. Antworte nur mit JSON im Format: {"title": "...", "description": "...", "priority": "...", "dueDate": "YYYY-MM-DD oder null"}'
            },
            {
              role: 'user',
              content: `Analysiere diese E-Mail und erstelle eine Aufgabe:\n\n${emailText}`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API Fehler');
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      setTitle(result.title || '');
      setDescription(result.description || '');
      setPriority(result.priority || 'mittel');
      if (result.dueDate) {
        setDueDate(result.dueDate);
      }

      toast.success('E-Mail erfolgreich analysiert!');
    } catch (error: any) {
      toast.error('Fehler bei der Analyse: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Bitte Titel eingeben");
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Nicht angemeldet");
        return;
      }

      const newTask = await createTask.mutateAsync({
        title,
        description,
        priority,
        due_date: dueDate || undefined,
        status: 'posteingang',
        created_by: user.id,
        assigned_to: assignedToGhlUserId || undefined,
        ghl_contact_id: ghlContactId || undefined,
      });

      // Upload files if any
      if (files.length > 0 && newTask) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `task-files/${newTask.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(filePath);

          await supabase.from('task_files').insert({
            task_id: newTask.id,
            file_url: publicUrl,
            file_key: filePath,
            filename: file.name,
            mime_type: file.type,
            file_size: file.size,
          });
        }
      }

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("mittel");
      setDueDate("");
      setEmailText("");
      setFiles([]);
      setAssignedToGhlUserId("");
      setGhlContactId("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Fehler beim Erstellen: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
          <DialogDescription>
            Erstelle eine neue Aufgabe manuell oder lasse sie per KI aus einer E-Mail analysieren
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-Mail Analyse */}
          <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
            <Label htmlFor="email-text">E-Mail-Text (Optional - KI-Analyse)</Label>
            <Textarea
              id="email-text"
              placeholder="Kopiere hier den E-Mail-Text ein..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={4}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={analyzeEmailWithAI}
              disabled={analyzing || !emailText.trim()}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Mit KI analysieren
                </>
              )}
            </Button>
          </div>

          {/* Aufgaben-Details */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Aufgabentitel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detaillierte Beschreibung..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorität</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="niedrig">Niedrig</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="hoch">Hoch</SelectItem>
                  <SelectItem value="dringend">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Fälligkeitsdatum</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Assign to User */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="assigned-to">Zuweisen an</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => syncUsers.mutate()}
                disabled={syncUsers.isPending}
              >
                <RefreshCw className={`h-3 w-3 ${syncUsers.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Select value={assignedToGhlUserId} onValueChange={setAssignedToGhlUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Beauftragten auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nicht zugewiesen</SelectItem>
                {ghlUsers.map((user) => (
                  <SelectItem key={user.id} value={user.ghl_user_id}>
                    {user.name || user.email || user.ghl_user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GHL Contact ID */}
          <div className="space-y-2">
            <Label htmlFor="ghl-contact-id">
              GoHighLevel Kontakt-ID (Optional)
            </Label>
            <Input
              id="ghl-contact-id"
              value={ghlContactId}
              onChange={(e) => setGhlContactId(e.target.value)}
              placeholder="z.B. nCv8ggmlFgT8QhXWUEKX"
            />
            <p className="text-xs text-muted-foreground">
              Nur erforderlich, wenn die Aufgabe mit GoHighLevel synchronisiert werden soll
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="files">Dateien anhängen</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {files.length} Datei(en) ausgewählt
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Erstelle...
                </>
              ) : (
                "Aufgabe erstellen"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

