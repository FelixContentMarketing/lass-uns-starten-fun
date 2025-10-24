import { Task } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityConfig = {
  niedrig: { color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Clock },
  mittel: { color: "bg-yellow-500/10 text-yellow-700 border-yellow-200", icon: AlertCircle },
  hoch: { color: "bg-orange-500/10 text-orange-700 border-orange-200", icon: AlertCircle },
  dringend: { color: "bg-red-500/10 text-red-700 border-red-200", icon: AlertCircle },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const PriorityIcon = priorityConfig[task.priority].icon;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
          <Badge 
            variant="outline"
            className={cn("shrink-0", priorityConfig[task.priority].color)}
          >
            <PriorityIcon className="h-3 w-3 mr-1" />
            {PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>
        {task.description && (
          <CardDescription className="line-clamp-2">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(task.dueDate), "dd. MMM yyyy", { locale: de })}
              </span>
            </div>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{task.assignedTo}</span>
            </div>
          )}
          {task.status === "erledigt" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Erledigt</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
