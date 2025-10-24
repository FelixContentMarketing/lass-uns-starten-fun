# 🚀 Schritt-für-Schritt Anleitung: SQL-Migration ausführen

## ⚠️ WICHTIG: Diese Migration muss ausgeführt werden!

Die Code-Änderungen wurden bereits zu GitHub gepusht, aber die **Datenbank-Migration muss manuell** in Supabase ausgeführt werden.

## 📋 Voraussetzungen

- Zugang zur Supabase Dashboard
- Die beiden GoHighLevel Users sind bereits in der `ghl_users` Tabelle vorhanden:
  - Christiane Brandt (ID: 0eEdii6BpBgwo0mSlQ94)
  - Felix Schmidt (ID: Kzj3WixN9NaFY9b0RtGN)

## 🔧 Schritt 1: Supabase Dashboard öffnen

1. Öffne deinen Browser
2. Gehe zu: https://supabase.com/dashboard/project/hdcjpcdnxyzkodpsoapf/editor
3. Melde dich an, falls erforderlich

## 📝 Schritt 2: SQL Editor öffnen

1. In der linken Seitenleiste, klicke auf **"SQL Editor"**
2. Klicke auf **"New query"** (oder verwende eine bestehende Query)

## 📄 Schritt 3: SQL-Skript kopieren

1. Öffne die Datei `fix_assigned_to_field.sql` in deinem Repository
2. Kopiere den **gesamten Inhalt** der Datei
3. Füge ihn in den SQL Editor in Supabase ein

**Alternativ:** Hier ist das komplette Skript:

```sql
-- ============================================
-- FIX: assigned_to Field Constraint Issue
-- ============================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

-- Step 2: Change the assigned_to column to TEXT to store GHL user IDs
ALTER TABLE public.tasks 
ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;

-- Step 3: Add a new foreign key constraint to ghl_users table
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assigned_to_ghl_user_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.ghl_users(ghl_user_id) ON DELETE SET NULL;

-- Step 4: Update the RLS policy to work with the new structure
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON public.tasks;

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.has_role(auth.uid(), 'admin')
  );

-- Step 5: Create an index on the assigned_to field for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
```

## ▶️ Schritt 4: Migration ausführen

1. Klicke auf den **"Run"** Button (oder drücke `Ctrl+Enter` / `Cmd+Enter`)
2. Warte, bis die Ausführung abgeschlossen ist
3. Überprüfe, ob die Meldung **"Success. No rows returned"** angezeigt wird

## ✅ Schritt 5: Verifikation

Führe diese Verifikations-Query aus, um zu bestätigen, dass die Migration erfolgreich war:

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
```
column_name  | data_type | is_nullable
-------------|-----------|------------
assigned_to  | text      | YES
```

## 🔄 Schritt 6: Lovable aktualisieren

Nach erfolgreicher Migration:

1. Gehe zu deinem Lovable-Projekt
2. Führe einen **Hard Refresh** durch: `Ctrl+Shift+R` (Windows/Linux) oder `Cmd+Shift+R` (Mac)
3. Lovable sollte jetzt die neuesten Änderungen von GitHub holen

**Hinweis:** Laut Lovable-Dokumentation sollte die GitHub-Integration automatisch synchronisieren, aber manchmal ist ein manueller Refresh erforderlich.

## 🧪 Schritt 7: Testen

Teste die Funktionalität:

1. ✅ Öffne die Anwendung in Lovable
2. ✅ Klicke auf **"Neue Aufgabe"**
3. ✅ Fülle das Formular aus:
   - Titel: "Test-Aufgabe"
   - Beschreibung: "Test der neuen assigned_to Funktionalität"
   - Zuweisen an: Wähle "Felix Schmidt" oder "Christiane Brandt"
4. ✅ Klicke auf **"Aufgabe erstellen"**
5. ✅ Überprüfe, ob die Aufgabe **ohne 409 Error** erstellt wird
6. ✅ Überprüfe, ob die Aufgabe im Kanban Board erscheint

## 🐛 Troubleshooting

### Problem: "relation does not exist" Error

**Lösung:** Stelle sicher, dass die `ghl_users` Tabelle existiert und die beiden Users eingetragen sind.

Führe aus:
```sql
SELECT * FROM public.ghl_users;
```

Falls leer, führe das `insert_users.sql` Skript aus.

### Problem: "constraint does not exist" Error beim DROP CONSTRAINT

**Lösung:** Das ist normal und kann ignoriert werden. Die Migration verwendet `IF EXISTS`, um sicherzustellen, dass sie auch funktioniert, wenn der Constraint bereits entfernt wurde.

### Problem: Lovable zeigt immer noch alte Typen

**Lösung:** 
1. Führe einen Hard Refresh durch: `Ctrl+Shift+R`
2. Oder: Schließe und öffne das Lovable-Projekt neu
3. Überprüfe in GitHub, ob die Änderungen tatsächlich gepusht wurden

### Problem: 409 Error tritt immer noch auf

**Lösung:**
1. Überprüfe, ob die Migration erfolgreich ausgeführt wurde (siehe Verifikation)
2. Überprüfe in Supabase Table Editor, ob `assigned_to` jetzt `text` ist
3. Führe einen Hard Refresh in Lovable durch
4. Lösche den Browser-Cache und versuche es erneut

## 📞 Hilfe benötigt?

Falls Probleme auftreten:
1. Überprüfe die Browser-Console auf Fehlermeldungen
2. Überprüfe die Supabase Logs
3. Erstelle ein GitHub Issue mit Screenshots und Fehlermeldungen

## ✨ Nach erfolgreicher Migration

Wenn alles funktioniert, kannst Du mit den nächsten Schritten fortfahren:

1. ✅ Drag & Drop im Kanban Board testen
2. ✅ Task-Details öffnen und bearbeiten
3. ✅ Zwei-Wege-Sync mit GoHighLevel testen
4. ✅ Webhooks implementieren (Phase 3)

---

**Viel Erfolg! 🚀**

