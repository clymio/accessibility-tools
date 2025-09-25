import { ipcMain } from 'electron';
import SystemStandardLib from '../lib/systemStandard';

ipcMain.handle('systemStandard:find', (_, data, opt) => {
  return SystemStandardLib.find(data, opt);
});
ipcMain.handle('systemStandard:findVersions', (_, data, opt) => {
  return SystemStandardLib.findVersions(data, opt);
});
ipcMain.handle('systemStandard:findPrinciples', (_, data, opt) => {
  return SystemStandardLib.findPrinciples(data, opt);
});
ipcMain.handle('systemStandard:findGuidelines', (_, data, opt) => {
  return SystemStandardLib.findGuidelines(data, opt);
});
ipcMain.handle('systemStandard:findCriteria', (_, data, opt) => {
  return SystemStandardLib.findCriteria(data, opt);
});
