import { formatTime, makeLinksClickable, formatFileSize } from './formatters.js';

export const messages = [];

export function addOutgoingMessage(text) {
  messages.push({
    id: Date.now(),
    text,
    type: 'outgoing',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  renderMessages();
}

export function renderMessages() {
  const container = document.getElementById('messages');
  container.innerHTML = '';

  messages.slice().reverse().forEach(msg => {
    const div = document.createElement('div');
    div.className = `message ${msg.type}`;

    if (msg.text) {
      const textBlock = document.createElement('div');
      textBlock.innerHTML = makeLinksClickable(msg.text);
      div.appendChild(textBlock);
    }

    if (msg.file) {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'file-preview';

      const link = document.createElement('a');
      link.href = msg.file.url;
      link.textContent = `📎 \${msg.file.name}`;
      link.target = 'blank';
      link.rel = 'noopener noreferrer';
      link.download = msg.file.name;
      
      fileDiv.appendChild(link);
      fileDiv.appendChild(document.createElement('span'));
      fileDiv.textContent = `${msg.file.name} (${msg.file.size})`;

      div.appendChild(fileDiv);
    }

    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
}