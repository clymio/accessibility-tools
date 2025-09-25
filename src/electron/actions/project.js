import { ipcMain } from 'electron';
import ProjectLib from '../lib/project';

ipcMain.handle('project:find', (_, data, opt) => {
  return ProjectLib.find(data, opt);
});
ipcMain.handle('project:read', (_, data, opt) => {
  return ProjectLib.read(data, opt);
});
ipcMain.handle('project:create', (_, data, opt) => {
  return ProjectLib.create(data, opt);
});
ipcMain.handle('project:update', (_, data, opt) => {
  return ProjectLib.update(data, opt);
});
ipcMain.handle('project:delete', (_, data, opt) => {
  return ProjectLib.delete(data, opt);
});
