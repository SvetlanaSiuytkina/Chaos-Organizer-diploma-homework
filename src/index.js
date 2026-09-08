import { addOutgoingMessage, renderMessages, messages, pinnedMessageId, loadFromLocalStorage, saveToLocalStorage } from './messages.js';
import { handleFile } from './files.js';
import './style.css';

const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const searchInput = document.getElementById('search-input');
const geoBtn = document.getElementById('geo-btn');

let currentOffset = 0;
const limit = 10;
let loading = false;
let hasMore = true;
let currentSearchQuery = '';

loadFromLocalStorage(); 

document.addEventListener('DOMContentLoaded', () => {
  loadMoreMessages();
});

async function loadMoreMessages() {
  if (loading || !hasMore) return;
  loading = true;
  
  try {
    let url = `/api/messages?offset=${currentOffset}&limit=${limit}`;
    if (currentSearchQuery) {
      url += `&q=${encodeURIComponent(currentSearchQuery)}`;
    }

    const response = await fetch(url);

    if (!response.ok) throw new Error('Ошибка сети');

    const data = await response.json();

    if (!data.messages || data.messages.length === 0) {
      hasMore = false;
      loading = false;
      return;
    }

    // добавляем новые сообщения в начало массива
    data.messages.forEach(msg => {
      // проверка, чтобы не дублировать сообщения, которые уже есть в localStorage
      if (!messages.find(m => m.id === msg.id)) {
        messages.unshift(msg);
      }
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

// обработчик скролла для ленивой подгрузки
messagesContainer.addEventListener('scroll', () => {
  if (messagesContainer.scrollTop === 0 && hasMore && !loading) {
    loadMoreMessages();
  }
});

// поиск
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    currentSearchQuery = query;
    currentOffset = 0;
    hasMore = true;

    messagesContainer.innerHTML = ''; 
    loadMoreMessages(); 
  });
}

// геолокация
if (geoBtn) {
  geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    geoBtn.disabled = true;
    geoBtn.textContent = 'Получение координат...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const geoText = `📍 Моя геолокация:\nШирота: ${lat.toFixed(6)}\nДолгота: ${lon.toFixed(6)}`;
        
        addOutgoingMessage(geoText);
        
        geoBtn.disabled = false;
        geoBtn.textContent = '🗺️ Геолокация';
      },
      (error) => {
        console.error('Ошибка получения геолокации:', error);
        alert('Не удалось получить координаты. Проверьте разрешения браузера');
        geoBtn.disabled = false;
        geoBtn.textContent = '🗺️ Геолокация';
      }
    );
  });
}

// отправка текста
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