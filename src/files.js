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

export function handleFile(file) {
  const previewUrl = URL.createObjectURL(file);
  
  messages.push({
    id: Date.now(),
    file: {
      name: file.name,
      size: formatFileSize(file.size),
      url: previewUrl
    },
    type: 'outgoing',
    timestamp: formatTime(new Date())
  });

  renderMessages();
}

setupClickHandlers();
setupDragHandlers();