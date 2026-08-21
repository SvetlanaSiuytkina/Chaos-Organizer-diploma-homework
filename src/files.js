import { formatTime, formatFileSize } from './formatters.js';
import { messages, renderMessages } from './messages.js';

const fileDropZone = document.getElementById('file-drop-zone');
const fileInput = document.getElementById('file-input');

function setupClickHandlers() {
  fileDropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;

    if (files.length > 0) {
      handleFile(files[0]);
      fileInput.value = '';
    }
  });
}

function setupDragHandlers() {
  const events = ['dragenter', 'dragover', 'dragleave', 'drop'];

  events.forEach((eventName) => {
    fileDropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
    });
  });
  
  fileDropZone.addEventListener('dragenter', () => fileDropZone.classList.add('hover'));
  fileDropZone.addEventListener('dragover', () => fileDropZone.classList.add('hover'));
  fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('hover'));
  
  fileDropZone.addEventListener('drop', (e) => {
    const dataTransfer = e.dataTransfer;
    const files = dataTransfer.files;

    if (files.length > 0) {
      handleFile(files[0]);
    }

    fileDropZone.classList.remove('hover');
  });
}

export async function handleFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      messages.push({
        id: Date.now(),
        file: {
          name: data.name,
          size: data.size,
          url: data.url,
        },
        type: 'outgoing',
        timestamp: formatTime(new Date())
      });
  
      renderMessages();
    } else {
      console.error('Ошибка сервера при загрузке:', data);
    }
  } catch (error) {
    console.error('Сетевая ошибка при загрузке файла:', error);
  }
}

setupClickHandlers();
setupDragHandlers();