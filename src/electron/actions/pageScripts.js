import { ipcMain } from 'electron';
import PageScriptsLib from '../lib/pageScripts';

ipcMain.handle('pageScripts:getFocusScript', async (_, data, opt) => {
  return PageScriptsLib.focusScript(data, opt);
});
ipcMain.handle('pageScripts:getRemoveFocusScript', async (_, data, opt) => {
  return PageScriptsLib.removeFocusScript(data, opt);
});
