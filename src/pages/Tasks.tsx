import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskTable } from "@/components/TaskTable";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/types";

const Tasks = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: dbTasks, isLoading } = useTasks();

  // Convert database tasks to UI format
  const tasks: Task[] = dbTasks?.map(task => ({
    id: task.id.toString(),
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority || "mittel",
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  })) || [];

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aufgaben</h1>
            <p className="text-muted-foreground">
              Alle Aufgaben in einer übersichtlichen Tabelle
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Lade Aufgaben...</p>
          </div>
        ) : (
          <TaskTable tasks={tasks} onTaskClick={handleTaskClick} />
        )}
      </div>
      <CreateTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
};

export default Tasks;
