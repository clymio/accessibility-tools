const { ipcMain, dialog } = require('electron');
import { REPORT_FORMATS } from '@/constants/report';
import fs from 'fs-extra';
import AuditLib from '../lib/audit';

ipcMain.handle('audit:find', (_, data, opt) => {
  return AuditLib.find(data, opt);
});
ipcMain.handle('audit:read', (_, data, opt) => {
  return AuditLib.read(data, opt);
});
ipcMain.handle('audit:create', (_, data, opt) => {
  return AuditLib.create(data, opt);
});
ipcMain.handle('audit:update', (_, data, opt) => {
  return AuditLib.update(data, opt);
});
ipcMain.handle('audit:delete', (_, data, opt) => {
  return AuditLib.delete(data, opt);
});
ipcMain.handle('audit:findAuditReportItems', (_, data, opt) => {
  return AuditLib.findAuditReportItems(data, opt);
});
ipcMain.handle('audit:updateAuditReportItem', (_, data, opt) => {
  return AuditLib.updateAuditReportItem(data, opt);
});
ipcMain.handle('audit:findAuditTypes', (_, data, opt) => {
  return AuditLib.findAuditTypes(data, opt);
});
ipcMain.handle('audit:findAuditChapters', (_, data, opt) => {
  return AuditLib.findAuditChapters(data, opt);
});
ipcMain.handle('audit:getStats', (_, data, opt) => {
  return AuditLib.getStats(data, opt);
});
ipcMain.handle('audit:generateReport', async (_, data, opt) => {
  const { buffer, name } = await AuditLib.generateReport(data, opt);
  let fileName = 'PDF', extension = 'pdf';
  if (data.format === REPORT_FORMATS.HTML) {
    fileName = 'HTML';
    extension = 'html';
  } else if (data.format === REPORT_FORMATS.JSON) {
    fileName = 'JSON';
    extension = 'json';
  }
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Audit Report',
    defaultPath: `${name}.${extension}`,
    filters: [{ name: `${fileName} Files`, extensions: [extension] }]
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
