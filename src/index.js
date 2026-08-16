// src/index.js
import { addOutgoingMessage } from './messages.js';
import { handleFile } from './files.js';
import './style.css';

const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');

//oтправк текста
function sendMessage() {
  const text = messageInput.value.trim();

  if (text) {
    addOutgoingMessage(text);
    messageInput.value = '';
    messageInput.focus();
  }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

if (messagesContainer) {
  messagesContainer.addEventListener('scroll', () => {
    if (messagesContainer.scrollTop === 0) {
      console.log('Подгрузка старых сообщений...');
    }
  });
}

console.log('Chaos Organizer запущен');