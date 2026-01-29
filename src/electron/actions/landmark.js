import { ipcMain } from 'electron';
import LandmarkLib from '../lib/landmark';

ipcMain.handle('landmark:find', (_, data, opt) => {
  return LandmarkLib.find(data, opt);
});
ipcMain.handle('landmark:read', (_, data, opt) => {
  return LandmarkLib.read(data, opt);
});
