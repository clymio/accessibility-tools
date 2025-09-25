import { ipcMain } from 'electron';
import EnvironmentLib from '../lib/environment';

ipcMain.handle('environment:find', (_, data, opt) => {
  return EnvironmentLib.find(data, opt);
});
ipcMain.handle('environment:read', (_, data, opt) => {
  return EnvironmentLib.read(data, opt);
});
ipcMain.handle('environment:create', async (_, data, opt) => {
  await EnvironmentLib.create(data, opt);
});
ipcMain.handle('environment:update', async (_, data, opt) => {
  return EnvironmentLib.update(data, opt);
});
ipcMain.handle('environment:delete', async (_, data, opt) => {
  return EnvironmentLib.delete(data, opt);
});
ipcMain.handle('environment:generate-sitemap', async (_, data, opt) => {
  return EnvironmentLib.generateSitemap(data, opt);
});
ipcMain.handle('environment:dns-lookup', (_, data, opt) => {
  return EnvironmentLib.dnsLookup(data, opt);
});
ipcMain.handle('environment:get-sitemap', (_, data, opt) => {
  return EnvironmentLib.getSitemap(data, opt);
});
ipcMain.handle('environment:create-page', (_, data, opt) => {
  return EnvironmentLib.createPage(data, opt);
});
