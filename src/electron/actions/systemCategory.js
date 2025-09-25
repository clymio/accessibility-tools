import { ipcMain } from 'electron';
import SystemCategoryLib from '../lib/systemCategory';

ipcMain.handle('systemCategory:find', (_, data, opt) => {
  return SystemCategoryLib.find(data, opt);
});
ipcMain.handle('systemCategory:read', (_, data, opt) => {
  return SystemCategoryLib.read(data, opt);
});
ipcMain.handle('systemCategory:create', (_, data, opt) => {
  return SystemCategoryLib.create(data, opt);
});
ipcMain.handle('systemCategory:update', (_, data, opt) => {
  return SystemCategoryLib.update(data, opt);
});
ipcMain.handle('systemCategory:updateIsSelected', (_, data, opt) => {
  return SystemCategoryLib.updateIsSelected(data, opt);
});
ipcMain.handle('systemCategory:updatePriority', (_, data, opt) => {
  return SystemCategoryLib.updatePriority(data, opt);
});
ipcMain.handle('systemCategory:delete', (_, data, opt) => {
  return SystemCategoryLib.delete(data, opt);
});
