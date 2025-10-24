import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useGhlUsers } from "@/hooks/useGhlUsers";
import { Task } from "@/lib/types";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"niedrig" | "mittel" | "hoch" | "dringend">("mittel");
  const [status, setStatus] = useState<"posteingang" | "in_freigabe" | "in_bearbeitung" | "erledigt">("posteingang");
  const [dueDate, setDueDate] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: ghlUsers = [] } = useGhlUsers();

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate || "");
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task || !title.trim()) {
      toast.error("Bitte Titel eingeben");
      return;
    }

    try {
      await updateTask.mutateAsync({
        id: task.id,
        updates: {
          title,
          description,
          priority,
          status,
          due_date: dueDate || undefined,
        },
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      await deleteTask.mutateAsync(task.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
      toast.success("Aufgabe gelöscht");
    } catch (error: any) {
      toast.error('Fehler beim Löschen: ' + error.message);
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aufgabe bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere die Details dieser Aufgabe
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel *</Label>
              <Input
                id="edit-title"
                placeholder="z.B. Angebot erstellen für Kunde XY"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschreibung</Label>
              <Textarea
                id="edit-description"
                placeholder="Weitere Details zur Aufgabe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posteingang">Posteingang</SelectItem>
                    <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                    <SelectItem value="in_freigabe">In Freigabe</SelectItem>
                    <SelectItem value="erledigt">Erledigt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priorität</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-due-date">Fälligkeitsdatum</Label>
              <Input
                id="edit-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={updateTask.isPending}>
                  {updateTask.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Speichere...
                    </>
                  ) : (
                    "Speichern"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aufgabe wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Aufgabe wird permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

