import { ipcMain } from 'electron';
import AccessibilitySettingsLib from '../lib/accessibilitySettings';

ipcMain.handle('accessibilitySettings:read', async () => {
  return AccessibilitySettingsLib.read();
});
ipcMain.handle('accessibilitySettings:update', async (_, data) => {
  return AccessibilitySettingsLib.update(data);
});
ipcMain.handle('accessibilitySettings:reset', async (_, data) => {
  return AccessibilitySettingsLib.reset(data);
});
