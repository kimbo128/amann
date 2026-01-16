# Homöopathie-Chatbot für Karl Heinz Amann
## Basierend auf "Klinische Materia Medica" von Robin Murphy

---

## 🏗️ Architektur-Übersicht

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   OpenAI API    │
│   (HTML/JS)     │◀────│   (Python)      │◀────│   (GPT-4)       │
│   Railway       │     │   Railway       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📁 Projektstruktur

```
amann/
├── backend/
│   ├── main.py              # FastAPI Server
│   ├── prompts.py           # System-Prompts für Homöopathie
│   ├── requirements.txt     # Python Dependencies
│   └── Procfile             # Railway Deployment
├── frontend/
│   ├── index.html           # Chat-Interface
│   ├── style.css            # Styling
│   └── script.js            # Chat-Logik
├── .env.example             # Beispiel Environment Variables
├── .gitignore
└── README.md
```

---

## 🚀 Technologie-Stack

| Komponente | Technologie | Warum? |
|------------|-------------|--------|
| Backend | **Python + FastAPI** | Einfach, schnell, Railway-kompatibel |
| Frontend | **Vanilla HTML/CSS/JS** | Kein Build-Prozess, sofort einsetzbar |
| LLM | **OpenAI GPT-4** | Bestes Wissen über Homöopathie |
| Hosting | **Railway** | Einfaches Deployment, kostenloser Tier |
| Versionierung | **GitHub** | Standard für Code-Management |

---

## 🔧 Deployment-Workflow

1. **Code in GitHub pushen** (https://github.com/kimbo128/amann)
2. **Railway mit GitHub verbinden**
3. **Environment Variables setzen** (OPENAI_API_KEY)
4. **Automatisches Deployment** bei jedem Push

---

## 💬 Prompt-Strategie für Homöopathie

Der System-Prompt ist **entscheidend** für die Qualität. Er enthält:

1. **Rolle**: Erfahrener Homöopath mit Wissen aus Murphy's Materia Medica
2. **Antwortformat**: Strukturiert nach Mittel, Indikationen, Modalitäten
3. **Vergleiche**: Ähnliche Mittel bei Bedarf nennen
4. **Sprache**: Deutsch, fachlich aber verständlich
5. **Quellenhinweis**: Hinweis auf Murphy wo relevant

---

## 🔐 Sicherheit

- API-Key nur in Railway Environment Variables (NIEMALS im Code!)
- CORS nur für eigene Domain erlauben
- Rate-Limiting im Backend

---

## 📈 Erweiterungsmöglichkeiten (Phase 2)

1. **RAG (Retrieval Augmented Generation)**
   - Buchinhalt digitalisieren und in Vektordatenbank speichern
   - Pinecone oder Supabase Vector als Speicher
   - Genauere Antworten basierend auf echtem Buchinhalt

2. **Mittel-Datenbank**
   - Alle Mittel aus dem Buch strukturiert speichern
   - Direktsuche nach Mittelnamen

3. **Benutzer-Feedback**
   - Herr Amann kann Antworten bewerten
   - Kontinuierliche Verbesserung

---

## ⚡ Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/kimbo128/amann.git
cd amann

# 2. Backend starten (lokal testen)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Frontend öffnen
# Einfach frontend/index.html im Browser öffnen
```

---

## 🎯 Nächste Schritte

1. [ ] API-Key in OpenAI rotieren (der alte ist kompromittiert!)
2. [ ] Neuen Key als `OPENAI_API_KEY` in Railway setzen
3. [ ] Code nach GitHub pushen
4. [ ] Railway Projekt erstellen und mit GitHub verbinden
5. [ ] Testen mit Herrn Amann
