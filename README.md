# 📖 Homöopathie-Chatbot - Materia Medica

Ein digitaler Assistent für die homöopathische Praxis, basierend auf Robin Murphy's "Klinische Materia Medica".

**Entwickelt für:** Karl Heinz Amann, Bad Säckingen

---

## 🚀 Schnellstart

### Voraussetzungen
- Python 3.10+
- OpenAI API Key

### Lokale Installation

```bash
# 1. Repository klonen
git clone https://github.com/kimbo128/amann.git
cd amann

# 2. Virtual Environment erstellen
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# 3. Dependencies installieren
pip install -r requirements.txt

# 4. Environment Variable setzen
# Erstelle .env Datei im backend/ Ordner:
echo OPENAI_API_KEY=dein-api-key > .env

# 5. Server starten
uvicorn main:app --reload
```

### Frontend öffnen
Öffne `frontend/index.html` im Browser.

---

## 🌐 Deployment auf Railway

### 1. Railway Projekt erstellen
1. Gehe zu [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Wähle `kimbo128/amann`

### 2. Service konfigurieren
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Environment Variables setzen
Im Railway Dashboard → Variables:
```
OPENAI_API_KEY=dein-api-key
```

### 4. Frontend URL anpassen
Nach dem Deployment bekommst du eine URL wie `https://amann-xyz.railway.app`.
Trage diese in `frontend/script.js` bei `API_URL` ein.

---

## 📁 Projektstruktur

```
amann/
├── backend/
│   ├── main.py          # FastAPI Server
│   ├── prompts.py       # System-Prompts
│   ├── requirements.txt # Dependencies
│   └── Procfile         # Railway Deployment
├── frontend/
│   ├── index.html       # Chat-Interface
│   ├── style.css        # Styling
│   └── script.js        # Chat-Logik
├── .env.example         # Beispiel Environment
├── .gitignore
├── ARCHITEKTUR.md       # Architektur-Dokumentation
└── README.md
```

---

## 💬 Verwendung

### Beispiel-Fragen:
- "Gib mir eine Übersicht zu Arnica montana"
- "Welches Mittel hilft bei Kopfschmerzen mit Übelkeit?"
- "Vergleiche Bryonia und Rhus toxicodendron"
- "Mittel mit Verschlechterung durch Kälte"

---

## 🔧 API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/` | GET | Health Check |
| `/health` | GET | Server Status |
| `/chat` | POST | Chat-Anfrage |
| `/search` | POST | Direkte Mittelsuche |

### Beispiel-Request:
```bash
curl -X POST https://deine-url.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Erzähle mir über Nux vomica", "conversation_history": []}'
```

---

## 🔐 Sicherheit

- ⚠️ **Niemals** den API-Key im Code committen!
- API-Key nur über Environment Variables setzen
- In Produktion: CORS auf eigene Domain beschränken

---

## 📈 Nächste Schritte (Phase 2)

- [ ] RAG mit echtem Buchinhalt
- [ ] Benutzer-Feedback System
- [ ] Mittel-Datenbank mit Direktsuche
- [ ] PWA für Offline-Nutzung

---

## 📝 Lizenz

Privates Projekt für die homöopathische Praxis Amann.

---

*Entwickelt mit ❤️ und Claude*
