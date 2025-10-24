export const APP_TITLE = "ProMech TASK Organizer";
export const APP_LOGO = "/placeholder.svg"; // Can be replaced with your logo

export const TASK_COLUMNS = {
  INBOX: "inbox",
  IN_APPROVAL: "in_approval", 
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export const COLUMN_LABELS = {
  [TASK_COLUMNS.INBOX]: "Posteingang",
  [TASK_COLUMNS.IN_APPROVAL]: "In Freigabe",
  [TASK_COLUMNS.IN_PROGRESS]: "In Bearbeitung",
  [TASK_COLUMNS.DONE]: "Erledigt",
} as const;

export const PRIORITY_LABELS = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  urgent: "Dringend",
} as const;

export type TaskColumn = typeof TASK_COLUMNS[keyof typeof TASK_COLUMNS];
export type TaskPriority = keyof typeof PRIORITY_LABELS;
