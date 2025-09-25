import { ipcMain } from 'electron';
import SystemCountryLib from '../lib/systemCountry';

ipcMain.handle('systemCountry:find', (_, data, opt) => {
  return SystemCountryLib.find(data, opt);
});
ipcMain.handle('systemCountry:read', (_, data, opt) => {
  return SystemCountryLib.read(data, opt);
});
