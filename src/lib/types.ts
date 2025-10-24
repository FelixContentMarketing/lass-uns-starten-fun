import { TaskColumn, TaskPriority } from "./constants";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskColumn;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
