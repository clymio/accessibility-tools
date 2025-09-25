import { ipcMain } from 'electron';
import RemediationLib from '../lib/remediation';

ipcMain.handle('remediation:find', (_, data, opt) => {
  return RemediationLib.find(data, opt);
});
ipcMain.handle('remediation:read', (_, data, opt) => {
  return RemediationLib.read(data, opt);
});
ipcMain.handle('remediation:create', (_, data, opt) => {
  return RemediationLib.create(data, opt);
});
ipcMain.handle('remediation:update', (_, data, opt) => {
  return RemediationLib.update(data, opt);
});
ipcMain.handle('remediation:updateIsSelected', (_, data, opt) => {
  return RemediationLib.updateIsSelected(data, opt);
});
ipcMain.handle('remediation:delete', (_, data, opt) => {
  return RemediationLib.delete(data, opt);
});
