import { ipcMain } from 'electron';
import ProfileLib from '../lib/profile';
import { buildMenu } from '../main';

ipcMain.handle('profile:find', (_, data, opt) => {
  return ProfileLib.find(data, opt);
});
ipcMain.handle('profile:read', (_, data, opt) => {
  return ProfileLib.read(data, opt);
});
ipcMain.handle('profile:create', async (_, data, opt) => {
  const profile = await ProfileLib.create(data, opt);
  await buildMenu();
  return profile;
});
ipcMain.handle('profile:update', (_, data, opt) => {
  return ProfileLib.update(data, opt);
});
ipcMain.handle('profile:delete', async (_, data, opt) => {
  const profile = await ProfileLib.delete(data, opt);
  await buildMenu();
  return profile;
});
