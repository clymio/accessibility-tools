import { ipcMain } from 'electron';
import AxeCoreLib from '../lib/axecore';

ipcMain.handle('test:getScript', async (_, ...args) => AxeCoreLib.getAxeScript(...args));
ipcMain.handle('test:runScript', async (_, ...args) => AxeCoreLib.getRunScript(...args));
ipcMain.handle('test:handleResult', async (_, ...args) => AxeCoreLib.handleResult(...args));
