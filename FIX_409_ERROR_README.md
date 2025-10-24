# Fix für 409 Conflict Error beim Erstellen von Tasks

## Problem

Beim Erstellen neuer Tasks durch den CreateTaskDialog trat ein **409 Conflict Error** auf.

### Ursache

Das `assigned_to` Feld in der `tasks` Tabelle hatte einen Foreign Key Constraint zu `public.profiles(id)`, welche wiederum auf `auth.users(id)` verweist. Das bedeutet, dass nur **Supabase Auth User IDs (UUIDs)** erlaubt waren.

Die Anwendung versuchte jedoch, **GoHighLevel User IDs** (z.B. `"Kzj3WixN9NaFY9b0RtGN"`) zu speichern, was den Foreign Key Constraint verletzte und zum 409 Conflict Error führte.

## Lösung

Die Lösung besteht darin, das `assigned_to` Feld so zu ändern, dass es GoHighLevel User IDs akzeptiert und auf die `ghl_users` Tabelle verweist.

### Schritt 1: SQL-Migration ausführen

**WICHTIG:** Diese Migration muss in der Supabase Web-UI ausgeführt werden!

1. Öffne die Supabase Dashboard: https://supabase.com/dashboard/project/hdcjpcdnxyzkodpsoapf/editor
2. Gehe zum **SQL Editor**
3. Öffne die Datei `fix_assigned_to_field.sql` in diesem Repository
4. Kopiere den gesamten Inhalt und füge ihn in den SQL Editor ein
5. Klicke auf **"Run"** um die Migration auszuführen

### Was macht die Migration?

Die Migration führt folgende Änderungen durch:

1. **Entfernt den alten Foreign Key Constraint** zu `profiles(id)`
2. **Ändert den Datentyp** von `assigned_to` von `UUID` zu `TEXT`
3. **Fügt einen neuen Foreign Key Constraint** zu `ghl_users(ghl_user_id)` hinzu
4. **Aktualisiert die RLS Policy**, um die neue Struktur zu unterstützen
5. **Erstellt einen Index** auf `assigned_to` für bessere Performance

### Schritt 2: Änderungen von GitHub pullen

Nach der Migration musst Du die aktualisierten TypeScript-Typen von GitHub pullen:

```bash
git pull origin main
```

### Was wurde im Code geändert?

1. **TypeScript-Typen aktualisiert** (`src/lib/supabase.ts`):
   - `Task.id`: von `number` zu `string` (UUID)
   - `Task.assigned_to`: Jetzt eindeutig als GHL User ID dokumentiert
   - `Task.created_by`: Jetzt eindeutig als Supabase Auth User ID dokumentiert
   - Alle anderen Typen entsprechend angepasst

2. **Hooks aktualisiert** (`src/hooks/useTasks.ts`):
   - Alle Funktionen verwenden jetzt `string` statt `number` für Task IDs

3. **UI-Komponenten aktualisiert**:
   - `Index.tsx` und `Tasks.tsx`: Entfernung von `.toString()` Aufrufen, da IDs bereits Strings sind

## Verifikation

Nach der Migration kannst Du folgende SQL-Abfrage ausführen, um zu verifizieren, dass die Änderungen erfolgreich waren:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name = 'assigned_to';
```

**Erwartetes Ergebnis:**
- `column_name`: assigned_to
- `data_type`: text
- `is_nullable`: YES

## Testen

Nach der Migration solltest Du:

1. ✅ Eine neue Aufgabe erstellen können
2. ✅ Einen GoHighLevel User zuweisen können
3. ✅ Die Aufgabe sollte in der lokalen Datenbank gespeichert werden
4. ✅ Die Aufgabe sollte zu GoHighLevel synchronisiert werden (wenn Kontakt-ID angegeben)

## Nächste Schritte

Nach erfolgreicher Behebung des 409 Errors:

1. **Drag & Drop testen**: Überprüfen, ob das Verschieben von Tasks zwischen Kanban-Spalten funktioniert
2. **Task-Details öffnen**: Überprüfen, ob das Öffnen und Bearbeiten von Tasks funktioniert
3. **Zwei-Wege-Sync testen**: Änderungen in GoHighLevel sollten zur lokalen DB synchronisiert werden
4. **Webhooks implementieren** (Phase 3): Für Echtzeit-Synchronisation

## Datenbankschema-Übersicht

### tasks Tabelle (nach Migration)

| Spalte | Typ | Constraint | Beschreibung |
|--------|-----|------------|--------------|
| id | UUID | PRIMARY KEY | Eindeutige Task-ID |
| title | TEXT | NOT NULL | Titel der Aufgabe |
| description | TEXT | | Beschreibung |
| status | task_status | NOT NULL | Status (inbox, in_progress, in_approval, done) |
| priority | task_priority | NOT NULL | Priorität (low, medium, high, urgent) |
| **assigned_to** | **TEXT** | **FK → ghl_users(ghl_user_id)** | **GoHighLevel User ID** |
| created_by | UUID | FK → auth.users(id) | Supabase Auth User ID |
| due_date | TIMESTAMPTZ | | Fälligkeitsdatum |
| created_at | TIMESTAMPTZ | NOT NULL | Erstellungsdatum |
| updated_at | TIMESTAMPTZ | NOT NULL | Aktualisierungsdatum |
| ghl_task_id | TEXT | | GoHighLevel Task ID (für Sync) |
| ghl_contact_id | TEXT | | GoHighLevel Contact ID (für Sync) |

### ghl_users Tabelle

| Spalte | Typ | Constraint | Beschreibung |
|--------|-----|------------|--------------|
| id | BIGSERIAL | PRIMARY KEY | Interne ID |
| **ghl_user_id** | VARCHAR(64) | **UNIQUE, NOT NULL** | **GoHighLevel User ID** |
| name | VARCHAR(255) | | Name des Users |
| email | VARCHAR(320) | | E-Mail-Adresse |
| last_synced_at | TIMESTAMPTZ | NOT NULL | Letzter Sync-Zeitpunkt |

## Kontakt

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/FelixContentMarketing/lass-uns-starten-fun/issues
- Entwickler: Manus AI Assistant

