import { dialog, ipcMain } from 'electron';
import fs from 'fs-extra';
import EnvironmentTestLib from '../lib/environmentTest';

ipcMain.handle('environmentTest:find', async (_, data, opt) => {
  return EnvironmentTestLib.find(data, opt);
});
ipcMain.handle('environmentTest:read', async (_, data, opt) => {
  return EnvironmentTestLib.read(data, opt);
});
ipcMain.handle('environmentTest:create', async (_, data, opt) => {
  return EnvironmentTestLib.create(data, opt);
});
ipcMain.handle('environmentTest:update', async (_, data, opt) => {
  return EnvironmentTestLib.update(data, opt);
});
ipcMain.handle('environmentTest:startTest', async (_, data, opt) => {
  return EnvironmentTestLib.startTest(data, opt);
});
ipcMain.handle('environmentTest:closeTest', async (_, data, opt) => {
  return EnvironmentTestLib.closeTest(data, opt);
});
ipcMain.handle('environmentTest:openClosedTest', async (_, data, opt) => {
  return EnvironmentTestLib.openClosedTest(data, opt);
});
ipcMain.handle('environmentTest:getSitemap', async (_, data, opt) => {
  return EnvironmentTestLib.getSitemap(data, opt);
});
ipcMain.handle('environmentTest:getStats', async (_, data, opt) => {
  return EnvironmentTestLib.getStats(data, opt);
});
ipcMain.handle('environmentTest:generateReport', async (_, data, opt) => {
  const { buffer, name } = await EnvironmentTestLib.generateReport(data, opt);
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Test Report',
    defaultPath: `${name}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });
  if (canceled || !filePath) return { success: false };
  try {
    fs.writeFileSync(filePath, buffer);
    return { success: true, message: 'File saved successfully' };
  } catch (err) {
    console.error('Error saving file:', err);
    return { success: false, message: 'Error saving file' };
  }
});
