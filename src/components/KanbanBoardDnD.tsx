import { useState } from "react";
import { Task } from "@/lib/types";
import { TASK_COLUMNS, COLUMN_LABELS, TaskColumn } from "@/lib/constants";
import { TaskCard } from "@/components/TaskCard";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskMove?: (taskId: string, newStatus: TaskColumn) => void;
}

// Sortable Task Card Wrapper
function SortableTaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

// Droppable Column
function DroppableColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: TaskColumn;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column,
  });
  const columnStyles: Record<TaskColumn, string> = {
    [TASK_COLUMNS.INBOX]: "border-t-blue-500",
    [TASK_COLUMNS.IN_APPROVAL]: "border-t-yellow-500",
    [TASK_COLUMNS.IN_PROGRESS]: "border-t-orange-500",
    [TASK_COLUMNS.DONE]: "border-t-green-500",
  };

  return (
    <div ref={setNodeRef}>
      <Card className={cn("flex flex-col border-t-4", columnStyles[column], isOver && "ring-2 ring-primary")}>
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold flex items-center justify-between">
          {COLUMN_LABELS[column]}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {tasks.length}
          </span>
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 min-h-[200px]">
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Keine Aufgaben
            </p>
          ) : (
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </ScrollArea>
    </Card>
    </div>
  );
}

export function KanbanBoard({ tasks, onTaskClick, onTaskMove }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const columns = Object.values(TASK_COLUMNS);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const getTasksByColumn = (column: TaskColumn) => {
    return tasks.filter((task) => task.status === column);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    
    // Check if we're over a column
    const overColumn = columns.find(col => col === overId);
    if (!overColumn) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === overColumn) return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    // Check if dropped over a column
    const overColumn = over.id as TaskColumn;
    
    if (columns.includes(overColumn) && task.status !== overColumn) {
      onTaskMove?.(taskId, overColumn);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((column) => {
          const columnTasks = getTasksByColumn(column);
          return (
            <SortableContext
              key={column}
              items={columnTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
              id={column}
            >
              <DroppableColumn
                column={column}
                tasks={columnTasks}
                onTaskClick={onTaskClick}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

