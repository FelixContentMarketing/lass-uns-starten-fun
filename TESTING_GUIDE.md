# 🧪 Testing Guide - ProMech TASK Organizer

## ✅ Was wurde implementiert?

Alle drei Probleme wurden behoben:

1. ✅ **Drag & Drop im Kanban Board** - Aufgaben können jetzt zwischen Spalten verschoben werden
2. ✅ **GoHighLevel Synchronisation** - Tasks werden korrekt mit GHL synchronisiert (inkl. `assigned_to` Feld)
3. ✅ **Task-Detail-Dialog** - Aufgaben können geöffnet, bearbeitet und gelöscht werden

## 🔄 Lovable aktualisieren

**WICHTIG:** Bevor Du testest, musst Du Lovable aktualisieren!

1. Öffne dein Lovable-Projekt
2. Führe einen **Hard Refresh** durch:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. Warte, bis Lovable die Änderungen von GitHub geholt hat
4. Überprüfe, ob die neuen Komponenten geladen wurden

## 📋 Test-Checkliste

### Test 1: Aufgabe erstellen ✅ (Bereits erfolgreich)

- [x] Neue Aufgabe erstellen funktioniert
- [x] Keine 409 Conflict Fehler mehr
- [x] Aufgabe erscheint im Kanban Board

### Test 2: Drag & Drop 🆕

**Schritte:**
1. Öffne das Kanban Board (Hauptseite)
2. Klicke und halte eine Aufgabe in der "Posteingang" Spalte
3. Ziehe die Aufgabe zur "In Bearbeitung" Spalte
4. Lasse die Maustaste los

**Erwartetes Verhalten:**
- ✅ Die Aufgabe sollte sich bewegen lassen
- ✅ Beim Hovern über einer Spalte sollte ein Ring erscheinen
- ✅ Die Aufgabe sollte in der neuen Spalte erscheinen
- ✅ Eine Success-Toast-Nachricht sollte erscheinen
- ✅ Die Aufgabe sollte in der Datenbank aktualisiert werden

**Mögliche Probleme:**
- ❌ Aufgabe lässt sich nicht bewegen → Hard Refresh durchführen
- ❌ Aufgabe springt zurück → Überprüfe Browser-Console auf Fehler
- ❌ Keine Toast-Nachricht → Überprüfe, ob `useUpdateTaskStatus` funktioniert

### Test 3: Task-Detail-Dialog öffnen 🆕

**Schritte:**
1. Klicke auf eine beliebige Aufgabe im Kanban Board
2. Der Task-Detail-Dialog sollte sich öffnen

**Erwartetes Verhalten:**
- ✅ Dialog öffnet sich mit allen Aufgaben-Details
- ✅ Titel, Beschreibung, Status, Priorität und Fälligkeitsdatum sind sichtbar
- ✅ Alle Felder sind editierbar

**Mögliche Probleme:**
- ❌ Dialog öffnet sich nicht → Überprüfe Browser-Console auf Fehler
- ❌ Felder sind leer → Überprüfe, ob `selectedTask` korrekt gesetzt wird

### Test 4: Aufgabe bearbeiten 🆕

**Schritte:**
1. Öffne eine Aufgabe (siehe Test 3)
2. Ändere den Titel zu "Test-Aufgabe (bearbeitet)"
3. Ändere die Beschreibung
4. Ändere den Status zu "In Freigabe"
5. Klicke auf "Speichern"

**Erwartetes Verhalten:**
- ✅ Dialog schließt sich
- ✅ Success-Toast-Nachricht erscheint
- ✅ Aufgabe erscheint in der neuen Spalte ("In Freigabe")
- ✅ Änderungen sind in der Datenbank gespeichert

**Mögliche Probleme:**
- ❌ Fehler beim Speichern → Überprüfe Browser-Console
- ❌ Aufgabe verschwindet → Überprüfe, ob `refetch` funktioniert

### Test 5: Aufgabe löschen 🆕

**Schritte:**
1. Öffne eine Test-Aufgabe
2. Klicke auf "Löschen"
3. Bestätige im Bestätigungs-Dialog

**Erwartetes Verhalten:**
- ✅ Bestätigungs-Dialog erscheint
- ✅ Nach Bestätigung wird die Aufgabe gelöscht
- ✅ Success-Toast-Nachricht erscheint
- ✅ Aufgabe verschwindet aus dem Kanban Board
- ✅ Wenn die Aufgabe eine GHL Task ID hat, wird sie auch aus GoHighLevel gelöscht

**Mögliche Probleme:**
- ❌ Aufgabe wird nicht gelöscht → Überprüfe Browser-Console
- ❌ GHL-Fehler → Überprüfe, ob GHL API-Credentials korrekt sind

### Test 6: GoHighLevel Synchronisation 🔄

**Vorbereitung:**
1. Erstelle eine Aufgabe in GoHighLevel (manuell über die GHL-UI)
2. Stelle sicher, dass die Aufgabe einem Kontakt zugeordnet ist
3. Weise die Aufgabe einem User zu (Felix oder Christiane)

**Schritte:**
1. Öffne das Kanban Board
2. Klicke auf "Synchronisieren" Button
3. Warte auf die Synchronisation

**Erwartetes Verhalten:**
- ✅ Spinner-Animation während der Synchronisation
- ✅ Success-Toast mit Anzahl der synchronisierten Aufgaben
- ✅ Neue Aufgabe erscheint im Kanban Board
- ✅ `assigned_to` Feld ist korrekt gesetzt (Felix oder Christiane)
- ✅ Status ist korrekt gemappt (completed → erledigt, sonst → posteingang)

**Mögliche Probleme:**
- ❌ Keine Aufgaben gefunden → Überprüfe GHL API-Credentials
- ❌ `assigned_to` ist leer → Überprüfe, ob die GHL User IDs in der `ghl_users` Tabelle existieren
- ❌ API-Fehler → Überprüfe Browser-Console und GHL API-Token

### Test 7: Zwei-Wege-Sync (Lokal → GHL) 🔄

**Schritte:**
1. Erstelle eine neue Aufgabe im Kanban Board
2. Gib eine **GoHighLevel Kontakt-ID** ein (z.B. `nCv8ggmlFgT8QhXWUEKX`)
3. Weise die Aufgabe einem User zu
4. Erstelle die Aufgabe
5. Überprüfe in GoHighLevel, ob die Aufgabe dort erscheint

**Erwartetes Verhalten:**
- ✅ Aufgabe wird in der lokalen DB erstellt
- ✅ Aufgabe wird zu GoHighLevel synchronisiert
- ✅ GHL Task ID wird in der lokalen DB gespeichert
- ✅ Success-Toast-Nachricht erscheint

**Mögliche Probleme:**
- ❌ Aufgabe wird nicht zu GHL synchronisiert → Überprüfe, ob Kontakt-ID korrekt ist
- ❌ GHL API-Fehler → Überprüfe API-Token und Permissions
- ❌ `ghl_task_id` ist leer → Überprüfe, ob die API-Response korrekt verarbeitet wird

## 🐛 Troubleshooting

### Problem: Drag & Drop funktioniert nicht

**Lösung:**
1. Hard Refresh: `Ctrl + Shift + R`
2. Überprüfe Browser-Console auf Fehler
3. Stelle sicher, dass `@dnd-kit` Pakete installiert sind
4. Überprüfe, ob `KanbanBoardDnD` statt `KanbanBoard` verwendet wird

### Problem: Task-Detail-Dialog öffnet sich nicht

**Lösung:**
1. Überprüfe Browser-Console auf Fehler
2. Stelle sicher, dass `TaskDetailDialog` importiert ist
3. Überprüfe, ob `onTaskClick` korrekt verdrahtet ist

### Problem: GHL Synchronisation schlägt fehl

**Lösung:**
1. Überprüfe GHL API-Credentials in den Einstellungen
2. Stelle sicher, dass das Token die richtigen Permissions hat:
   - `tasks.readonly`
   - `tasks.write`
   - `users.readonly`
   - `locations.readonly`
3. Überprüfe, ob die Location ID korrekt ist
4. Überprüfe Browser-Console auf API-Fehler

### Problem: `assigned_to` wird nicht synchronisiert

**Lösung:**
1. Stelle sicher, dass die GHL User IDs in der `ghl_users` Tabelle existieren
2. Führe das `insert_users.sql` Skript aus, falls noch nicht geschehen
3. Überprüfe, ob die Migration `fix_assigned_to_field.sql` ausgeführt wurde

### Problem: Lovable zeigt alte Version

**Lösung:**
1. Hard Refresh: `Ctrl + Shift + R`
2. Schließe und öffne das Lovable-Projekt neu
3. Überprüfe in GitHub, ob die Änderungen gepusht wurden
4. Warte 1-2 Minuten und versuche es erneut

## 📊 Erwartete Ergebnisse

Nach erfolgreichem Testing solltest Du:

- ✅ Aufgaben zwischen Kanban-Spalten verschieben können
- ✅ Aufgaben öffnen und bearbeiten können
- ✅ Aufgaben löschen können
- ✅ Aufgaben von GoHighLevel importieren können
- ✅ Aufgaben zu GoHighLevel exportieren können
- ✅ Zwei-Wege-Synchronisation funktioniert

## 🎯 Nächste Schritte

Nach erfolgreichem Testing:

1. **Webhooks implementieren** (Phase 3):
   - GoHighLevel Webhooks für TaskCreate, TaskComplete, TaskDelete
   - Echtzeit-Synchronisation ohne manuellen Sync-Button

2. **Weitere Features**:
   - Filter und Suche im Kanban Board
   - Aufgaben-Kommentare
   - Aufgaben-Tags
   - Benachrichtigungen

3. **Performance-Optimierung**:
   - Lazy Loading für große Task-Listen
   - Caching für GHL API-Calls

---

**Viel Erfolg beim Testen! 🚀**

Bei Problemen: Überprüfe die Browser-Console und erstelle ein GitHub Issue mit Screenshots und Fehlermeldungen.

