import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KanbanBoard } from "@/components/KanbanBoardDnD";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { Task as DBTask } from "@/lib/supabase";
import { Task } from "@/lib/types";
import { TaskColumn } from "@/lib/constants";
import { syncGhlTasks } from "@/lib/ghl-api";
import { toast } from "sonner";

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { data: dbTasks, isLoading, refetch } = useTasks();
  const updateTaskStatus = useUpdateTaskStatus();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncGhlTasks();
      await refetch();
      
      if (result.errors && result.errors > 0) {
        toast.warning(
          `${result.synced} von ${result.total} Aufgaben synchronisiert (${result.errors} Fehler)`,
          { description: 'Einige Aufgaben konnten nicht synchronisiert werden. Prüfe die Console für Details.' }
        );
      } else if (result.message) {
        toast.info(result.message);
      } else {
        toast.success(`${result.synced} von ${result.total} Aufgaben erfolgreich synchronisiert`);
      }
    } catch (error: any) {
      console.error('Sync-Fehler:', error);
      toast.error('Fehler bei der Synchronisation: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Convert database tasks to UI format
  const tasks: Task[] = dbTasks?.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority || "mittel",
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  })) || [];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskColumn) => {
    try {
      await updateTaskStatus.mutateAsync({ id: taskId, newStatus });
    } catch (error: any) {
      console.error('Fehler beim Verschieben:', error);
      toast.error('Fehler beim Verschieben der Aufgabe');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aufgaben-Board</h1>
            <p className="text-muted-foreground">
              Verwalte deine Aufgaben im Kanban-Style
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSync} disabled={syncing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Synchronisieren
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Aufgabe
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Lade Aufgaben...</p>
          </div>
        ) : (
          <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} onTaskMove={handleTaskMove} />
        )}
      </div>
      <CreateTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <TaskDetailDialog task={selectedTask} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />
    </DashboardLayout>
  );
};

export default Index;
