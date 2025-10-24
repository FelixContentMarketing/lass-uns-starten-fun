import { Task } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface TaskTableProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const priorityColors = {
  niedrig: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  mittel: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  hoch: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const statusLabels = {
  inbox: "Posteingang",
  "in-approval": "In Freigabe",
  "in-progress": "In Bearbeitung",
  done: "Erledigt",
};

const statusColors = {
  inbox: "bg-gray-500/10 text-gray-500",
  "in-approval": "bg-orange-500/10 text-orange-500",
  "in-progress": "bg-blue-500/10 text-blue-500",
  done: "bg-green-500/10 text-green-500",
};

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priorität</TableHead>
            <TableHead>Fällig am</TableHead>
            <TableHead>Erstellt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Keine Aufgaben vorhanden
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTaskClick?.(task)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div>{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("de-DE")
                    : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                    locale: de,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
