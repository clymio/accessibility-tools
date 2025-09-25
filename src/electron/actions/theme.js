import { ipcMain, nativeTheme } from 'electron';

ipcMain.handle('theme:set', (_, v) => {
  if (['light', 'dark'].indexOf(v) === -1) return;
  nativeTheme.themeSource = v;
  return nativeTheme.themeSource;
});

ipcMain.handle('theme:current', () => {
  return nativeTheme.themeSource;
});

ipcMain.on('theme:system', () => {
  nativeTheme.themeSource = 'system';
});
