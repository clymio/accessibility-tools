import { CHECK_UPDATE_INTERVAL, DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH, MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from '@/constants/app';
import { SETTINGS_TABS } from '@/constants/settings';
import { is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, protocol, shell } from 'electron';
import log from 'electron-log/main';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';
import { getPort } from 'get-port-please';
import { startServer } from 'next/dist/server/lib/start-server';
import path, { join } from 'path';
import process from 'process';
import { BUCKET_URL } from '../../../config/bucket.js';
import packageJson from '../../../package.json';
import { boot, getModel } from '../lib/db';
import '../lib/joi';

log.initialize();

const productName = packageJson.productName;
const isMac = process.platform === 'darwin';

app.setName(productName);

let window, port;

let manualUpdateCheck = false,
  isDownloading = false;

const createWindow = async () => {
  const eulaAccepted = await isEulaAccepted();
  const isEulaWindow = !eulaAccepted;
  const icon = join(__dirname, '/favicon.png');
  const mainWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    center: true,
    show: true,
    autoHideMenuBar: false,
    title: productName,
    frame: !isMac || isEulaWindow,
    titleBarStyle: isMac && !isEulaWindow ? 'hiddenInset' : undefined,
    trafficLightPosition: isMac && !isEulaWindow ? { x: 15, y: 10 } : undefined,
    icon,
    ...(process.platform === 'linux' ? { icon: '/favicon.png' } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      webSecurity: true,
      devTools: !app.isPackaged,
      webviewTag: true
    }
  });
  if (!isEulaWindow) {
    mainWindow.maximize();
  }
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
  if (process.platform === 'darwin') {
    const image = nativeImage.createFromPath(app.getAppPath() + '/public/assets/favicon.png');
    app.dock.setIcon(image);
  }
  const loadURL = async () => {
    if (is.dev) {
      port = 3000;
      mainWindow.loadURL(`http://localhost:${port}${isEulaWindow ? '/eula' : ''}`);
    } else {
      try {
        port = await startNextJSServer();
        log.info('next js server started');
        console.log('Next.js server started on port:', port);
        mainWindow.loadURL(`http://localhost:${port}${isEulaWindow ? '/eula' : ''}`);
      } catch (error) {
        console.error('Error starting Next.js server:', error);
      }
    }
  };
  await buildMenu();
  initAutoUpdater(mainWindow);
  await loadURL();
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle(productName);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    handleExternalLink(details.url);
    return { action: 'deny' };
  });
  window = mainWindow;
  return mainWindow;
};

const startNextJSServer = async () => {
  if (port) return port;
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), 'app');

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: 'localhost',
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true
    });
    process.title = productName;

    return nextJSPort;
  } catch (error) {
    console.error('Error starting Next.js server:', error);
    throw error;
  }
};

const handleExternalLink = async (url) => {
  const Settings = getModel('settings');
  const settings = await Settings.findByPk(1);
  const hasPermission = settings.can_open_browser;
  if (hasPermission) {
    return shell.openExternal(url);
  }
  const result = await dialog.showMessageBox(window, {
    type: 'question',
    buttons: ['Yes, open in browser', 'No'],
    defaultId: 0,
    cancelId: 1,
    title: 'Allow External Links',
    message: 'Do you want external links to be opened in the browser?'
  });
  if (result.response === 0) {
    settings.can_open_browser = true;
    await settings.save();
    await shell.openExternal(url);
  }
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      registerCustomProtocol();
      log.info('booting db...');
      await boot();
      log.info('boot succeeded. Creating window...');
      await createWindow();
      log.info('window created');
    } catch (e) {
      log.error('Error booting app');
      log.debug(e);
      dialog.showErrorBox(`An error occurred`, 'Try restarting the app. If the problem persists, please contact support.');
      app.quit();
    }

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });
  });
}

app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

import '../actions';

ipcMain.handle('system:exit', () => {
  app.quit();
  process.exit();
});

ipcMain.handle('system:acceptEula', async () => {
  const Settings = getModel('settings');
  const settingsObj = await Settings.findByPk(1);
  settingsObj.is_eula_accepted = true;
  await settingsObj.save();
  window.destroy();
  await createWindow();
});

ipcMain.handle('system:getAssetsPath', () => {
  if (!app.isPackaged) {
    return '/assets';
  }
  return `app://`;
});

process.on('uncaughtException', function (error) {
  console.error(error);
});

function registerCustomProtocol() {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    const filePath = path.join(process.resourcesPath, 'assets', url.pathname);

    try {
      const data = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).slice(1);
      const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        svg: 'image/svg+xml',
        ico: 'image/x-icon'
      };

      return new Response(data, {
        headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }
      });
    } catch (error) {
      return new Response('Not found', { status: 404 });
    }
  });
}

function checkForUpdates() {
  try {
    autoUpdater.checkForUpdates();
  } catch (e) {
    log.error('Auto updater error');
    log.debug(e);
  }
}

function initAutoUpdater(win) {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: BUCKET_URL
  });

  checkForUpdates();

  autoUpdater.on('download-progress', () => {
    isDownloading = true;
  });

  autoUpdater.on('update-downloaded', () => {
    isDownloading = false;
    manualUpdateCheck = false;
    dialog
      .showMessageBox(win, {
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Would you like to restart and install it now?',
        buttons: ['Yes', 'Later']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on('update-not-available', () => {
    if (manualUpdateCheck) {
      dialog.showMessageBox(win, {
        type: 'info',
        title: 'No Updates',
        message: 'You are already using the latest version.'
      });
      manualUpdateCheck = false;
    }
  });

  autoUpdater.on('error', (err) => {
    log.error('Auto updater error');
    log.debug(err);
    if (manualUpdateCheck) {
      dialog.showErrorBox('Update Error', err?.message || 'An error occurred while checking for updates.');
      manualUpdateCheck = false;
    }
  });

  setInterval(() => {
    log.info('Performing scheduled update check...');
    checkForUpdates();
  }, CHECK_UPDATE_INTERVAL);
}

function checkForManualUpdates() {
  if (isDownloading) {
    dialog.showMessageBox(window, {
      type: 'info',
      title: 'Update Downloading',
      message: 'A new update is currently being downloaded in the background. You can continue using the app.',
      buttons: ['OK']
    });
  } else {
    manualUpdateCheck = true;
    checkForUpdates();
  }
}

async function isEulaAccepted() {
  const Settings = getModel('settings');
  const settingsObj = await Settings.findByPk(1);
  return settingsObj.is_eula_accepted;
}

export const setWindowZoom = (zoom) => {
  if (window) {
    window.webContents.setZoomFactor(zoom);
  }
};

export const getAssignedPort = () => port;

export const buildMenu = async () => {
  const Profile = getModel('profile');
  const hasProfile = !!(await Profile.findOne());
  const template = [
    ...(isMac
      ? [
          {
            label: productName,
            submenu: [
              { role: 'about', label: 'About' },
              {
                label: 'Check for Updates...',
                click: () => {
                  checkForManualUpdates();
                }
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide', label: 'Hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit', label: 'Quit' }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          click: () => {
            window.webContents.send('navigate', '/?openCreate=true');
          }
        },
        {
          label: 'New Audit',
          click: () => {
            window.webContents.send('navigate', '/audits?openCreate=true');
          }
        },
        {
          label: 'New Test Case',
          click: () => {
            window.webContents.send('navigate', '/testCases?openCreate=true');
          }
        },
        {
          label: 'New Remediation',
          click: () => {
            window.webContents.send('navigate', '/remediations?openCreate=true');
          }
        },
        { type: 'separator' },
        ...(!hasProfile
          ? [
              {
                label: 'New Profile',
                click: () => {
                  window.webContents.send('navigate', `/settings?tab=${SETTINGS_TABS.PROFILE}&openCreate=true`);
                }
              }
            ]
          : []),
        {
          label: 'New Environment',
          click: () => {
            window.webContents.send('navigate', `/settings?tab=${SETTINGS_TABS.ENVIRONMENTS}&openCreate=true`);
          }
        },
        {
          label: 'New Remediation Category',
          click: () => {
            window.webContents.send('navigate', `/settings?tab=${SETTINGS_TABS.REMEDIATION_CATEGORIES}&openCreate=true`);
          }
        },
        { type: 'separator' },
        {
          label: 'Accessibility Settings',
          click: () => {
            window.webContents.send('navigate', `/settings?tab=${SETTINGS_TABS.ACCESSIBILITY}`);
          }
        },
        ...(!isMac ? [{ type: 'separator' }, { role: 'quit', label: 'Quit' }] : [])
      ]
    },
    {
      label: 'Edit',
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(!app.isPackaged ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      role: 'windowMenu'
    },
    {
      label: 'Help',
      submenu: [
        ...(!isMac ? [{ role: 'about', label: 'About' }] : []),
        {
          label: 'Documentation',
          click: async () => await handleExternalLink('https://accessibility-tools.clym.io')
        },
        {
          label: 'Learn More',
          click: async () => {
            const url = 'https://github.com/clymio/accessibility-tools';
            await handleExternalLink(url);
          }
        },
        ...(!isMac
          ? [
              { type: 'separator' },
              {
                label: 'Check for Updates...',
                click: () => {
                  checkForManualUpdates();
                }
              }
            ]
          : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
