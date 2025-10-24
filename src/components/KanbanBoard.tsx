import { Task } from "@/lib/types";
import { TASK_COLUMNS, COLUMN_LABELS, TaskColumn } from "@/lib/constants";
import { TaskCard } from "./TaskCard";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const columns = Object.values(TASK_COLUMNS);

  const getTasksByColumn = (column: TaskColumn) => {
    return tasks.filter((task) => task.status === column);
  };

  const columnStyles: Record<TaskColumn, string> = {
    [TASK_COLUMNS.INBOX]: "border-t-blue-500",
    [TASK_COLUMNS.IN_APPROVAL]: "border-t-yellow-500",
    [TASK_COLUMNS.IN_PROGRESS]: "border-t-orange-500",
    [TASK_COLUMNS.DONE]: "border-t-green-500",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {columns.map((column) => {
        const columnTasks = getTasksByColumn(column);
        return (
          <Card 
            key={column} 
            className={cn("flex flex-col border-t-4", columnStyles[column])}
          >
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center justify-between">
                {COLUMN_LABELS[column]}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {columnTasks.length}
                </span>
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Keine Aufgaben
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onClick={() => onTaskClick?.(task)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        );
      })}
    </div>
  );
}
