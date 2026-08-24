import { formatTime, makeLinksClickable, formatFileSize } from './formatters.js';

export const messages = [];
export let pinnedMessageId = null;

//офлайн и кэш
export function saveToLocalStorage() {
  localStorage.setItem('chaos_messages_cache', JSON.stringify(messages));
}

//воызвр из лок.стор
export function loadFromLocalStorage() {
  const cached = localStorage.getItem('chaos_messages_cache');

  if (cached) {
    const parsed = JSON.parse(cached);

    parsed.forEach(msg => messages.push({
      id: msg.id,
      text: msg.text,
      type: msg.type,
      timestamp: msg.timestamp,
      pinned: msg.pinned || false,
      favorited: msg.favorited || false,
      file: msg.file || null
    }));
  }
}

export function togglePin(id) {
  if (pinnedMessageId === id) {
    pinnedMessageId = null;
  } else {
    pinnedMessageId = id;
  }

  saveToLocalStorage();
  renderMessages();
}

export async function addOutgoingMessage(text) {
  const localMsg = {
    id: Date.now(),
    text,
    type: 'outgoing',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pinned: false,
    favorited: false,
    file: null
  }

  messages.push(localMsg);
  renderMessages();
  saveToLocalStorage();

  renderMessages();

  try {
    const response = await fetch('api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({text})
    });

    if (!response.ok) throw new Error('Ошибка сохранения на сервере');
  } catch (e) {
    console.error('Не удалось сохранить на сервере', e);
  }
}

export function renderMessages() {
  const container = document.getElementById('messages');
  container.innerHTML = '';
  const listToRender = messages;

  if (pinnedMessageId) {
    const pinnedMsg = listToRender.find(m => m.id === pinnedMessageId);
    if (pinnedMsg) {
      container.appendChild(createMessageElement(pinnedMsg, true));
    }
  }

  listToRender
    .filter(m => m.id !== pinnedMessageId)
    .slice().reverse()
    .forEach(msg => {
      container.appendChild(createMessageElement(msg, false));
    });

    container.scrollTop = container.scrollHeight;
  }

  function createMessageElement(msg, isPinned) {
    const div = document.createElement('div');
    div.className = `message ${msg.type}`;
    if (isPinned) div.style.borderTop = '3px solid #0088cc';
    
    if (msg.text) {let processedText = msg.text.replace(/```([\s\S]*?)```/g, (match, code) => 
      `<div style="background:#eee; padding:5px; font-family:monospace;">${code}</div>`
    );
    processedText = makeLinksClickable(processedText);
    
    const textBlock = document.createElement('div');
    textBlock.innerHTML = processedText;
    div.appendChild(textBlock);
  }
  
  if (msg.file) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-preview';

    const link = document.createElement('a');
    link.href = msg.file.url;
    link.textContent = `📎 ${msg.file.name} (${msg.file.size})`;
    link.target = 'blank';
    link.rel = 'noopener noreferrer';
    link.download = msg.file.name;

    const ext = msg.file.name.split('.').pop().toLowerCase();
    let icon = '📎';
    if (['jpg', 'png', 'gif'].includes(ext)) icon = '📸';
    
    link.textContent = `${icon} ${msg.file.name} (${msg.file.size})`;
    fileDiv.appendChild(link);
    div.appendChild(fileDiv);
  }

  const controls = document.createElement('div');
  controls.style.marginTop = '5px';
  controls.style.fontSize = '11px';
  controls.style.color = '#666';
  controls.style.display = 'flex';
  controls.style.gap = '10px';

  const pinBtn = document.createElement('button');
  pinBtn.textContent = isPinned ? '📌 Закреплено' : '📌 Закрепить';
  pinBtn.disabled = isPinned;
  pinBtn.style.background = 'none';
  pinBtn.style.border = 'none';
  pinBtn.style.cursor = 'pointer';
  pinBtn.onclick = () => togglePin(msg.id);
  controls.appendChild(pinBtn);

  div.appendChild(controls);
  return div;
}