import { addOutgoingMessage, renderMessages, messages } from './messages.js';
import { handleFile } from './files.js';
import './style.css';

const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const searchInput = document.getElementById('search-input');

let currentOffset = 0;
const limit = 10;
let loading = false;
let hasMore = true;
let currentSearchQuery = '';

async function loadMoreMessages() {
  if (loading || !hasMore) return;
  loading = true;
  
  try {
    const response = await fetch(`/api/messages?offset=${currentOffset}&limit=${limit}`);

    if (!response.ok) throw new Error('Ошибка сети');

    const data = await response.json();

    if (!data.messages || data.messages.length === 0) {
      hasMore = false;
      loading = false;
      return;
    }

    data.messages.forEach(msg => {
      messages.unshift(msg);
    });

    renderMessages();
    currentOffset = data.offset;

    if (!data.hasMore) {
      hasMore = false;
    }
  } catch (error) {
    console.error('Ошибка при подгрузке сообщений: ', error);
    loading = false;
  }
}

messagesContainer.addEventListener('scroll', () => {
  if (messagesContainer.scrollTop === 0 && hasMore && !loading) {
    loadMoreMessages();
  }
});

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    currentSearchQuery = query;

    if (!query) {
      renderMessages();
      return;
    }
    const filtered = messages.filter(m => {
      const hasTextMatch = m.text && m.text.toLowerCase().includes(query);
      const hasFileMatch = m.file && m.file.name.toLowerCase().includes(query);
      return hasTextMatch || hasFileMatch;
    });

    renderMessages(filtered);
  });
}

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

console.log('Chaos Organizer запущен');