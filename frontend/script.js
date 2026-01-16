/**
 * Materia Medica - Homöopathie-Chatbot
 * Profi-Version für Dr. Karl Heinz Amann
 * Dynamische Vorschläge & Klinische Analyse
 */

const CONFIG = {
    API_URL: '' 
};

let conversationHistory = [];
let isListening = false;

// DOM Elemente
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const quickActionsContainer = document.querySelector('.quick-actions');

/**
 * Spracherkennung (Voice-to-Text)
 */
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('active');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value += transcript;
        autoResizeTextarea();
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => stopListening();

    micBtn.onclick = () => {
        if (isListening) recognition.stop();
        else recognition.start();
    };
} else {
    micBtn.style.display = 'none';
}

function stopListening() {
    isListening = false;
    micBtn.classList.remove('active');
}

/**
 * Chat zurücksetzen (Neuer Fall)
 */
function resetChat() {
    if (confirm('Möchten Sie den aktuellen Fall schließen und einen neuen Fall starten?')) {
        conversationHistory = [];
        const welcomeMessage = chatMessages.querySelector('.message.assistant');
        chatMessages.innerHTML = '';
        if (welcomeMessage) chatMessages.appendChild(welcomeMessage);
        
        // Reset Quick Actions to default
        updateQuickActions(['Nux vomica', 'Kopfschmerzen', 'Pulsatilla vs Sepia', 'Erkältung']);
        
        messageInput.value = '';
        autoResizeTextarea();
        messageInput.focus();
    }
}

/**
 * Nachricht senden
 */
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    messageInput.value = '';
    sendBtn.disabled = true;
    autoResizeTextarea();
    
    addMessage(message, 'user');
    const loadingId = showLoading();
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                conversation_history: conversationHistory
            })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        removeLoading(loadingId);
        
        // Extrahiere Vorschläge aus dem Text
        const { cleanContent, suggestions } = extractSuggestions(data.response);
        
        addMessage(cleanContent, 'assistant');
        
        if (suggestions.length > 0) {
            updateQuickActions(suggestions);
        }
        
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.response }
        );
        
        if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);
        
    } catch (error) {
        console.error('Fehler:', error);
        removeLoading(loadingId);
        addMessage('Verbindung zum klinischen Server unterbrochen.', 'assistant');
    }
    
    sendBtn.disabled = false;
    messageInput.focus();
}

/**
 * Extrahiert die [VORSCHLÄGE: ...] Zeile aus dem Text
 */
function extractSuggestions(text) {
    const regex = /\[VORSCHLÄGE: (.+?)\]/i;
    const match = text.match(regex);
    
    if (match) {
        const cleanContent = text.replace(regex, '').trim();
        const suggestions = match[1].split('|').map(s => s.trim());
        return { cleanContent, suggestions };
    }
    
    return { cleanContent: text, suggestions: [] };
}

/**
 * Aktualisiert die Quick Action Buttons
 */
function updateQuickActions(suggestions) {
    quickActionsContainer.innerHTML = '';
    suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'quick-btn';
        btn.textContent = s;
        btn.onclick = () => sendQuickMessage(s);
        quickActionsContainer.appendChild(btn);
    });
}

function sendQuickMessage(message) {
    messageInput.value = message;
    sendMessage();
}

function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);
    
    if (role === 'assistant') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = `
            <button class="action-btn" onclick="copyToClipboard(this)">📋 Kopieren</button>
            <button class="action-btn" onclick="window.print()">🖨️ Drucken</button>
        `;
        contentDiv.appendChild(actionsDiv);
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessage(text) {
    let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    formatted = formatted.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    
    formatted = formatted.replace(/&lt;/g, '<strong style="color: #e74c3c; font-size: 1.1em;">&lt;</strong>');
    formatted = formatted.replace(/&gt;/g, '<strong style="color: #4A7C59; font-size: 1.1em;">&gt;</strong>');
    
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    if (formatted.includes('|')) {
        const lines = formatted.split('\n');
        let tableHtml = '<table>';
        let inTable = false;
        lines.forEach(line => {
            if (line.trim().startsWith('|')) {
                const cells = line.split('|').filter(c => c.trim().length > 0);
                tableHtml += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
                inTable = true;
            }
        });
        tableHtml += '</table>';
        if (inTable) formatted = formatted.replace(/\|[\s\S]+\|/g, tableHtml);
    }
    
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    
    return formatted.startsWith('<') ? formatted : `<p>${formatted}</p>`;
}

function copyToClipboard(btn) {
    const content = btn.closest('.message-content').innerText;
    const cleanContent = content.replace('📋 Kopieren', '').replace('🖨️ Drucken', '').trim();
    navigator.clipboard.writeText(cleanContent).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Kopiert';
        setTimeout(() => btn.innerHTML = originalText, 2000);
    });
}

function showLoading() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = id;
    div.innerHTML = `<div class="message-content"><div class="loading"><span></span><span></span><span></span></div></div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

messageInput.addEventListener('input', autoResizeTextarea);
document.addEventListener('DOMContentLoaded', () => messageInput.focus());
