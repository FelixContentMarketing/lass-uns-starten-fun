import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/lib/types";
import { TASK_COLUMNS } from "@/lib/constants";

// Mock data für das Dashboard
const mockTasks: Task[] = [
  {
    id: "1",
    title: "E-Mail von Kunde XY bearbeiten",
    description: "Anfrage zur Projektplanung Q1 2025",
    status: TASK_COLUMNS.INBOX,
    priority: "high",
    assignedTo: "Max Mustermann",
    dueDate: "2025-11-01",
    createdAt: "2025-10-20T10:00:00Z",
    updatedAt: "2025-10-20T10:00:00Z",
  },
  {
    id: "2",
    title: "Angebot erstellen für Projekt Alpha",
    description: "Detailliertes Angebot mit Zeitplan und Kostenaufstellung",
    status: TASK_COLUMNS.IN_APPROVAL,
    priority: "urgent",
    dueDate: "2025-10-28",
    createdAt: "2025-10-19T14:30:00Z",
    updatedAt: "2025-10-21T09:15:00Z",
  },
  {
    id: "3",
    title: "Wartung Server durchführen",
    description: "Routinemäßige Systemwartung und Updates installieren",
    status: TASK_COLUMNS.IN_PROGRESS,
    priority: "medium",
    assignedTo: "Lisa Schmidt",
    dueDate: "2025-10-30",
    createdAt: "2025-10-18T08:00:00Z",
    updatedAt: "2025-10-22T11:30:00Z",
  },
  {
    id: "4",
    title: "Dokumentation aktualisieren",
    description: "Neue Features in der Dokumentation ergänzen",
    status: TASK_COLUMNS.DONE,
    priority: "low",
    assignedTo: "Tom Weber",
    createdAt: "2025-10-15T13:45:00Z",
    updatedAt: "2025-10-23T16:20:00Z",
  },
  {
    id: "5",
    title: "Kundentermin vorbereiten",
    description: "Präsentation und Demo für Neukunde vorbereiten",
    status: TASK_COLUMNS.INBOX,
    priority: "high",
    dueDate: "2025-10-29",
    createdAt: "2025-10-21T09:00:00Z",
    updatedAt: "2025-10-21T09:00:00Z",
  },
  {
    id: "6",
    title: "Bug Fix: Login-Problem beheben",
    description: "Fehler bei der Anmeldung auf mobilen Geräten",
    status: TASK_COLUMNS.IN_PROGRESS,
    priority: "urgent",
    assignedTo: "Max Mustermann",
    dueDate: "2025-10-25",
    createdAt: "2025-10-20T15:20:00Z",
    updatedAt: "2025-10-23T10:45:00Z",
  },
];

const Index = () => {
  const [tasks] = useState<Task[]>(mockTasks);

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
    // Hier könnte ein Dialog geöffnet werden
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>
        <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
