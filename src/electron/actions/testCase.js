import { ipcMain } from 'electron';
import TestCaseLib from '../lib/testCase';

ipcMain.handle('testCase:find', (_, data, opt) => {
  return TestCaseLib.find(data, opt);
});
ipcMain.handle('testCase:read', (_, data, opt) => {
  return TestCaseLib.read(data, opt);
});
ipcMain.handle('testCase:create', (_, data, opt) => {
  return TestCaseLib.create(data, opt);
});
ipcMain.handle('testCase:update', (_, data, opt) => {
  return TestCaseLib.update(data, opt);
});
ipcMain.handle('testCase:updateIsSelected', (_, data, opt) => {
  return TestCaseLib.updateIsSelected(data, opt);
});
ipcMain.handle('testCase:delete', (_, data, opt) => {
  return TestCaseLib.delete(data, opt);
});
