"""
Homöopathie-Chatbot Backend für Karl Heinz Amann
Basierend auf "Klinische Materia Medica" von Robin Murphy
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
import os
from prompts import SYSTEM_PROMPT

app = FastAPI(
    title="Homöopathie-Chatbot",
    description="Chatbot basierend auf Robin Murphy's Klinische Materia Medica",
    version="1.0.0"
)

# CORS für Frontend-Zugriff
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []


class ChatResponse(BaseModel):
    response: str


# API Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Hauptendpoint für Chat-Anfragen.
    Nimmt eine Nachricht und optional die bisherige Konversation entgegen.
    """
    try:
        # Nachrichten für OpenAI aufbauen
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Bisherige Konversation hinzufügen (max. letzte 10 Nachrichten)
        for msg in request.conversation_history[-10:]:
            messages.append(msg)
        
        # Aktuelle Nachricht hinzufügen
        messages.append({"role": "user", "content": request.message})
        
        # OpenAI API aufrufen
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=2000
        )
        
        assistant_message = response.choices[0].message.content
        
        return ChatResponse(response=assistant_message)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
async def search_remedy(remedy_name: str):
    """
    Direkte Suche nach einem homöopathischen Mittel.
    """
    try:
        search_prompt = f"""
        Bitte gib mir eine vollständige Übersicht über das homöopathische Mittel "{remedy_name}" 
        im Stil von Robin Murphy's Klinische Materia Medica.
        """
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": search_prompt}
        ]
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=2500
        )
        
        return {"remedy": remedy_name, "description": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Statische Dateien (Frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")


# Hauptseite -> Frontend
@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
