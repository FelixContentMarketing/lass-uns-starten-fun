# ProMech TASK Organizer

Ein intelligentes Aufgabenverwaltungs-Dashboard mit bidirektionaler GoHighLevel-Synchronisation, KI-gestützter E-Mail-Analyse und Kanban-Board.

## 🎯 Projektübersicht

ProMech TASK Organizer ist eine moderne Webanwendung, die entwickelt wurde, um die Aufgabenverwaltung zu optimieren und nahtlos mit GoHighLevel zu synchronisieren. Die Plattform ermöglicht es, E-Mails schnell in strukturierte Aufgaben umzuwandeln, Dateien anzuhängen und den gesamten Workflow über ein intuitives Kanban-Board zu verwalten.

## ✨ Hauptfunktionen

### 📋 Kanban-Board mit 4 Spalten
- **Posteingang** - Neue, noch nicht zugewiesene Aufgaben
- **In Freigabe** - Aufgaben, die auf Freigabe warten
- **In Bearbeitung** - Aktiv bearbeitete Aufgaben
- **Erledigt** - Abgeschlossene Aufgaben

### 🤖 KI-gestützte E-Mail-Verarbeitung
- Kopiere E-Mail-Text direkt in das Dashboard
- OpenAI/Claude analysiert den Text automatisch
- Automatisches Ausfüllen von:
  - Titel
  - Beschreibung
  - Priorität
  - Fälligkeitsdatum
  - Zugewiesene Person

### 📎 Datei-Upload
- Unterstützt PDFs, Bilder, Tabellen
- Sichere Speicherung in S3
- Mehrere Dateien pro Aufgabe

### 🔄 Zwei-Wege-Synchronisation mit GoHighLevel
- **Dashboard → GoHighLevel**: Neue Aufgaben werden automatisch in GHL erstellt
- **GoHighLevel → Dashboard**: Webhooks synchronisieren Änderungen zurück
- Status-Updates werden bidirektional synchronisiert

### 📊 Status-Tracking
- Jeder Status-Wechsel wird mit Zeitstempel protokolliert
- Nachvollziehbare Historie für jede Aufgabe
- Auswertung der Bearbeitungsdauer

### 👥 Benutzerverwaltung
- Integration mit GoHighLevel-Benutzern
- Aufgaben können Personen zugewiesen werden
- Synchronisation der Zuweisungen mit GHL

## 🛠️ Technologie-Stack

### Frontend
- **React 19** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS 4** für Styling
- **shadcn/ui** Komponenten
- **wouter** für Routing
- **tRPC** für Type-Safe API-Calls

### Backend
- **Express 4** Server
- **tRPC 11** für API-Routen
- **MySQL/TiDB** Datenbank
- **Drizzle ORM** für Datenbankzugriff

### Integrationen
- **GoHighLevel API v2** für Task-Synchronisation
- **OpenAI API** für KI-gestützte Textanalyse
- **S3 Storage** für Datei-Uploads
- **Webhooks** für Echtzeit-Synchronisation

## 📦 Datenbankstruktur

### Tabellen

#### `tasks`
Haupttabelle für alle Aufgaben mit folgenden Feldern:
- `id` - Primärschlüssel
- `ghlTaskId` - GoHighLevel Task ID (für Sync)
- `title` - Aufgabentitel
- `description` - Detaillierte Beschreibung
- `status` - Kanban-Status (posteingang, in_freigabe, in_bearbeitung, erledigt)
- `priority` - Priorität (niedrig, mittel, hoch, dringend)
- `dueDate` - Fälligkeitsdatum
- `assignedToUserId` - Zugewiesener Benutzer (lokale User ID)
- `assignedToGhlUserId` - GoHighLevel User ID
- `contactId` - GoHighLevel Contact ID
- `createdByUserId` - Ersteller
- `createdAt`, `updatedAt`, `completedAt` - Zeitstempel

#### `taskStatusHistory`
Protokolliert jeden Status-Wechsel:
- `id` - Primärschlüssel
- `taskId` - Referenz zur Aufgabe
- `oldStatus` - Vorheriger Status
- `newStatus` - Neuer Status
- `changedAt` - Zeitpunkt der Änderung
- `changedByUserId` - Benutzer, der die Änderung vorgenommen hat

#### `taskFiles`
Speichert Datei-Anhänge:
- `id` - Primärschlüssel
- `taskId` - Referenz zur Aufgabe
- `fileUrl` - S3 URL zur Datei
- `fileKey` - S3 File Key
- `filename` - Originaler Dateiname
- `mimeType` - MIME Type
- `fileSize` - Dateigröße in Bytes
- `uploadedAt` - Upload-Zeitpunkt
- `uploadedByUserId` - Uploader

#### `ghlUsers`
Cache für GoHighLevel-Benutzer:
- `id` - Primärschlüssel
- `ghlUserId` - GoHighLevel User ID
- `name` - Name
- `email` - E-Mail
- `lastSyncedAt` - Letzter Sync-Zeitpunkt

#### `appSettings`
Globale Einstellungen:
- `id` - Primärschlüssel
- `key` - Setting-Schlüssel (z.B. "ghl_api_token", "ghl_location_id")
- `value` - Setting-Wert
- `description` - Beschreibung
- `updatedAt` - Letztes Update
- `updatedByUserId` - Benutzer, der das Setting aktualisiert hat

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 22+
- pnpm
- MySQL/TiDB Datenbank
- GoHighLevel Account mit Private Integration Token

### Installation

1. Repository klonen:
```bash
git clone https://github.com/FelixContentMarketing/ProMech-TASK-Organizer.git
cd ProMech-TASK-Organizer
```

2. Abhängigkeiten installieren:
```bash
pnpm install
```

3. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env
```

Erforderliche Umgebungsvariablen:
- `DATABASE_URL` - MySQL/TiDB Connection String
- `JWT_SECRET` - Secret für Session-Cookies
- `VITE_APP_TITLE` - App-Titel
- `VITE_APP_LOGO` - Logo-URL

4. Datenbank-Migrationen ausführen:
```bash
pnpm db:push
```

5. Development Server starten:
```bash
pnpm dev
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## ⚙️ Konfiguration

### GoHighLevel Integration

1. **Private Integration Token erstellen:**
   - Gehe zu deinem GoHighLevel Account
   - Navigiere zu Settings → Integrations → Private Integration
   - Erstelle einen neuen Token mit folgenden Scopes:
     - `tasks.write`
     - `tasks.readonly`
     - `users.readonly`

2. **Location ID ermitteln:**
   - Die Location ID findest du in der URL deiner GoHighLevel Location
   - Format: `https://app.gohighlevel.com/location/{LOCATION_ID}/...`

3. **Einstellungen im Dashboard speichern:**
   - Öffne die Admin-Einstellungen im Dashboard
   - Trage den Private Integration Token ein
   - Trage die Location ID ein
   - Speichere die Einstellungen

### Webhooks konfigurieren

1. **Webhook-URL ermitteln:**
   - Nach dem Deployment: `https://deine-domain.com/api/webhooks/ghl`
   - Lokal (für Tests): `https://ngrok.io/api/webhooks/ghl` (mit ngrok)

2. **Webhooks in GoHighLevel einrichten:**
   - Gehe zu Settings → Integrations → Webhooks
   - Füge eine neue Webhook-URL hinzu
   - Wähle folgende Events aus:
     - `TaskCreate`
     - `TaskComplete`
     - `TaskDelete`

### OpenAI API (für KI-Textanalyse)

1. OpenAI API Key erstellen: https://platform.openai.com/api-keys
2. Im Dashboard unter Admin-Einstellungen eintragen

## 📖 API-Dokumentation

### GoHighLevel API Endpunkte

#### Tasks erstellen
```http
POST https://services.leadconnectorhq.com/tasks/
Authorization: Bearer {PRIVATE_INTEGRATION_TOKEN}
Version: 2021-07-28

{
  "title": "Aufgabentitel",
  "body": "Beschreibung",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedTo": "USER_ID",
  "contactId": "CONTACT_ID"
}
```

#### Tasks aktualisieren
```http
PUT https://services.leadconnectorhq.com/tasks/{taskId}
Authorization: Bearer {PRIVATE_INTEGRATION_TOKEN}
Version: 2021-07-28

{
  "title": "Neuer Titel",
  "completed": true
}
```

#### Benutzer abrufen
```http
GET https://services.leadconnectorhq.com/users/{userId}
Authorization: Bearer {PRIVATE_INTEGRATION_TOKEN}
Version: 2021-07-28
```

### Webhook Payloads

#### TaskCreate Event
```json
{
  "type": "TaskCreate",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "id": "5HrB1IbmnKMBXloldFuP",
  "assignedTo": "bNl8QNGXhIQJLv8eeASQ",
  "body": "Aufgabenbeschreibung",
  "contactId": "WFwVrSSjZ2CNHbZThQX2",
  "dateAdded": "2021-11-29T13:37:28.304Z",
  "dueDate": "2021-12-22T06:55:00.000Z",
  "title": "Aufgabentitel"
}
```

## 🎨 Design

### Farbschema
- **Primärfarbe:** Dunkel (Dark Theme)
- **Sekundärfarbe:** Gold `#ad925e`
- **Hintergrund:** Dunkle Töne
- **Text:** Helle Töne für Kontrast

### UI-Komponenten
- Moderne, minimalistische Oberfläche
- Drag & Drop für Kanban-Board
- Responsive Design für Mobile und Desktop
- Smooth Animations und Transitions

## 🔐 Sicherheit

- **Authentifizierung:** Manus OAuth 2.0
- **API-Token:** Verschlüsselte Speicherung in der Datenbank
- **Datei-Upload:** Validierung und Größenbeschränkung
- **CORS:** Konfiguriert für sichere Cross-Origin-Requests
- **SQL Injection:** Geschützt durch Drizzle ORM

## 📝 Entwicklungs-Roadmap

### Phase 1: Grundlagen ✅
- [x] Datenbankstruktur
- [x] Backend-API (tRPC)
- [x] GoHighLevel API-Integration recherchiert

### Phase 2: Kanban-Dashboard (In Arbeit)
- [ ] Kanban-Board UI
- [ ] Drag & Drop Funktionalität
- [ ] Task-Detailansicht
- [ ] Status-Änderungen mit History

### Phase 3: Datei-Upload
- [ ] Datei-Upload-Komponente
- [ ] S3-Integration
- [ ] Datei-Vorschau
- [ ] Datei-Download

### Phase 4: GoHighLevel-Synchronisation
- [ ] Task-Erstellung in GHL
- [ ] Task-Updates zu GHL
- [ ] Benutzer-Synchronisation
- [ ] Webhook-Endpunkt

### Phase 5: KI-Integration
- [ ] OpenAI API-Integration
- [ ] E-Mail-Text-Analyse
- [ ] Automatisches Ausfüllen
- [ ] Prompt-Optimierung

### Phase 6: Zwei-Wege-Sync
- [ ] Webhook-Handler
- [ ] Realtime-Updates im Frontend
- [ ] Konfliktauflösung
- [ ] Sync-Status-Anzeige

### Phase 7: Testing & Deployment
- [ ] Unit-Tests
- [ ] Integration-Tests
- [ ] Performance-Optimierung
- [ ] Deployment-Setup

## 🤝 Beitragen

Dieses Projekt ist aktuell in aktiver Entwicklung. Contributions sind willkommen!

## 📄 Lizenz

Dieses Projekt ist privat und für den internen Gebrauch bestimmt.

## 📞 Support

Bei Fragen oder Problemen, bitte ein Issue auf GitHub erstellen.

---

**Entwickelt mit ❤️ für effizientes Aufgabenmanagement**

