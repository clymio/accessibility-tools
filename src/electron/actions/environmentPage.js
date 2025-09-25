import { dialog, ipcMain } from 'electron';
import fs from 'fs-extra';
import EnvironmentPageLib from '../lib/environmentPage';

ipcMain.handle('environmentPage:findTestCases', async (_, data, opt) => {
  return EnvironmentPageLib.findTestCases(data, opt);
});
ipcMain.handle('environmentPage:findTestCaseNodes', async (_, data, opt) => {
  return EnvironmentPageLib.findTestCaseNodes(data, opt);
});
ipcMain.handle('environmentPage:readTestCase', async (_, data, opt) => {
  return EnvironmentPageLib.readTestCase(data, opt);
});
ipcMain.handle('environmentPage:findEnvironmentTest', async (_, data, opt) => {
  return EnvironmentPageLib.findEnvironmentTest(data, opt);
});
ipcMain.handle('environmentPage:updateEnvironmentTestTarget', async (_, data, opt) => {
  return EnvironmentPageLib.updateEnvironmentTestTarget(data, opt);
});
ipcMain.handle('environmentPage:generateReport', async (_, data, opt) => {
  const { csv: report, name } = await EnvironmentPageLib.generateReport(data, opt);
  const title = opt.is_remediation_report ? 'Save Remediations CSV' : 'Save Test Cases CSV';
  const { canceled, filePath } = await dialog.showSaveDialog({
    title,
    defaultPath: name,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  if (canceled || !filePath) return { success: false };
  try {
    fs.writeFileSync(filePath, report);
    return { success: true, message: 'File saved successfully' };
  } catch (err) {
    console.error('Error saving file:', err);
    return { success: false, message: 'Error saving file' };
  }
});
