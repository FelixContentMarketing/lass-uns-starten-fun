export const APP_TITLE = "ProMech TASK Organizer";
export const APP_LOGO = "/placeholder.svg"; // Can be replaced with your logo

export const TASK_COLUMNS = {
  INBOX: "posteingang",
  IN_PROGRESS: "in_bearbeitung",
  IN_APPROVAL: "in_freigabe", 
  DONE: "erledigt",
} as const;

export const COLUMN_LABELS = {
  [TASK_COLUMNS.INBOX]: "Posteingang",
  [TASK_COLUMNS.IN_APPROVAL]: "In Freigabe",
  [TASK_COLUMNS.IN_PROGRESS]: "In Bearbeitung",
  [TASK_COLUMNS.DONE]: "Erledigt",
} as const;

export const PRIORITY_LABELS = {
  niedrig: "Niedrig",
  mittel: "Mittel",
  hoch: "Hoch",
  dringend: "Dringend",
} as const;

export type TaskColumn = typeof TASK_COLUMNS[keyof typeof TASK_COLUMNS];
export type TaskPriority = keyof typeof PRIORITY_LABELS;
