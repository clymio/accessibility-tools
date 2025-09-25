import { ipcMain } from 'electron';
import SystemEnvironment from '../lib/systemEnvironment';

ipcMain.handle('systemEnvironment:find', (_, data, opt) => {
  return SystemEnvironment.find(data, opt);
});
ipcMain.handle('systemEnvironment:read', (_, data, opt) => {
  return SystemEnvironment.read(data, opt);
});
ipcMain.handle('systemEnvironment:create', (_, data, opt) => {
  return SystemEnvironment.create(data, opt);
});
ipcMain.handle('systemEnvironment:update', (_, data, opt) => {
  return SystemEnvironment.update(data, opt);
});
ipcMain.handle('systemEnvironment:updateIsSelected', (_, data, opt) => {
  return SystemEnvironment.updateIsSelected(data, opt);
});
ipcMain.handle('systemEnvironment:delete', (_, data, opt) => {
  return SystemEnvironment.delete(data, opt);
});
