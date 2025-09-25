import { ipcMain } from 'electron';
import TechnologyLib from '../lib/technology';

ipcMain.handle('technology:find', (_, data, opt) => {
  return TechnologyLib.find(data, opt);
});
ipcMain.handle('technology:read', (_, data, opt) => {
  return TechnologyLib.read(data, opt);
});
ipcMain.handle('technology:create', (_, data, opt) => {
  return TechnologyLib.create(data, opt);
});
ipcMain.handle('technology:update', (_, data, opt) => {
  return TechnologyLib.update(data, opt);
});
ipcMain.handle('technology:delete', (_, data, opt) => {
  return TechnologyLib.delete(data, opt);
});
