export function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function makeLinksClickable(text) {
  return text.replace(/http(s?):\/\/[^\s]+/g, (url) => {
    return `<a href="${url}" target="blank" rel="noopener noreferrer">${url}</a>`;
  });
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, index)).toFixed(2)) + ' ' + sizes[index];
}