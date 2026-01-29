const { ipcRenderer } = require('electron');

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    ipcRenderer.sendToHost('escape-pressed', {
      shift: e.shiftKey
    });
  }
}, true);
