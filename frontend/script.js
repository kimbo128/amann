/**
 * Materia Medica - Homöopathie-Chatbot
 * Frontend JavaScript
 */

// Konfiguration
const CONFIG = {
    // Für lokale Entwicklung:
    // API_URL: 'http://localhost:8000'
    // Für Railway Production (wird nach Deployment angepasst):
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000' 
        : 'https://amann-backend.railway.app'  // Hier deine Railway URL eintragen!
};

// Konversations-Historie
let conversationHistory = [];

// DOM Elemente
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

/**
 * Nachricht senden
 */
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Input leeren und deaktivieren
    messageInput.value = '';
    sendBtn.disabled = true;
    autoResizeTextarea();
    
    // User-Nachricht anzeigen
    addMessage(message, 'user');
    
    // Loading anzeigen
    const loadingId = showLoading();
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversation_history: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Loading entfernen
        removeLoading(loadingId);
        
        // Antwort anzeigen
        addMessage(data.response, 'assistant');
        
        // Historie aktualisieren
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.response }
        );
        
        // Historie begrenzen (letzte 20 Nachrichten)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
        
    } catch (error) {
        console.error('Fehler:', error);
        removeLoading(loadingId);
        addMessage('Entschuldigung, es gab einen Fehler bei der Verbindung zum Server. Bitte versuchen Sie es erneut.', 'assistant');
    }
    
    sendBtn.disabled = false;
    messageInput.focus();
}

/**
 * Quick-Message senden
 */
function sendQuickMessage(message) {
    messageInput.value = message;
    sendMessage();
}

/**
 * Nachricht zum Chat hinzufügen
 */
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Markdown-ähnliche Formatierung (einfach)
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Zum Ende scrollen
    scrollToBottom();
}

/**
 * Einfache Markdown-Formatierung
 */
function formatMessage(text) {
    // Escape HTML
    let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Headers (### -> h3)
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    
    // Bold (**text**)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic (*text*)
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Listen (- item)
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Zeilenumbrüche
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // In Paragraph einwickeln
    if (!formatted.startsWith('<')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
}

/**
 * Loading-Indikator anzeigen
 */
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = 'loading-' + Date.now();
    
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="loading">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    
    return loadingDiv.id;
}

/**
 * Loading-Indikator entfernen
 */
function removeLoading(id) {
    const loadingDiv = document.getElementById(id);
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

/**
 * Zum Ende des Chats scrollen
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Tastendruck-Handler
 */
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * Textarea automatisch vergrößern
 */
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Event Listener
messageInput.addEventListener('input', autoResizeTextarea);

// Fokus auf Input beim Laden
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
});
