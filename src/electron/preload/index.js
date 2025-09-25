import { contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log/renderer';

// Custom APIs for renderer
const api = {
  global: {
    onNavigate: (callback) => {
      const listener = (_, path) => callback(path);
      ipcRenderer.on('navigate', listener);
      return () => {
        ipcRenderer.removeListener('navigate', listener);
      };
    }
  },
  theme: {
    set: v => ipcRenderer.invoke('theme:set', v),
    current: () => ipcRenderer.invoke('theme:current'),
    setToSystem: () => ipcRenderer.send('theme:system')
  },
  project: {
    find: (data, opt) => ipcRenderer.invoke('project:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('project:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('project:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('project:update', data, opt),
    delete: data => ipcRenderer.invoke('project:delete', data)
  },
  environment: {
    find: id => ipcRenderer.invoke('environment:find', id),
    read: (data, opt) => ipcRenderer.invoke('environment:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('environment:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('environment:update', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('environment:delete', data, opt),
    dnsLookup: (data, opt) => ipcRenderer.invoke('environment:dns-lookup', data, opt),
    generateSitemap: (data, opt) => ipcRenderer.invoke('environment:generate-sitemap', data, opt),
    getSitemap: (data, opt) => ipcRenderer.invoke('environment:get-sitemap', data, opt),
    createPage: (data, opt) => ipcRenderer.invoke('environment:create-page', data, opt)
  },
  environmentTest: {
    find: (data, opt) => ipcRenderer.invoke('environmentTest:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('environmentTest:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('environmentTest:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('environmentTest:update', data, opt),
    start: (data, opt) => ipcRenderer.invoke('environmentTest:startTest', data, opt),
    close: (data, opt) => ipcRenderer.invoke('environmentTest:closeTest', data, opt),
    openClosedTest: (data, opt) => ipcRenderer.invoke('environmentTest:openClosedTest', data, opt),
    getSitemap: (data, opt) => ipcRenderer.invoke('environmentTest:getSitemap', data, opt),
    getStats: (data, opt) => ipcRenderer.invoke('environmentTest:getStats', data, opt),
    generateReport: (data, opt) => ipcRenderer.invoke('environmentTest:generateReport', data, opt)
  },
  environmentPage: {
    findTestCases: (data, opt) => ipcRenderer.invoke('environmentPage:findTestCases', data, opt),
    findTestCaseNodes: (data, opt) => ipcRenderer.invoke('environmentPage:findTestCaseNodes', data, opt),
    readTestCase: (data, opt) => ipcRenderer.invoke('environmentPage:readTestCase', data, opt),
    findEnvironmentTest: (data, opt) => ipcRenderer.invoke('environmentPage:findEnvironmentTest', data, opt),
    updateEnvironmentTestTarget: (data, opt) => ipcRenderer.invoke('environmentPage:updateEnvironmentTestTarget', data, opt),
    generateReport: (data, opt) => ipcRenderer.invoke('environmentPage:generateReport', data, opt)
  },
  testCase: {
    find: (data, opt) => ipcRenderer.invoke('testCase:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('testCase:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('testCase:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('testCase:update', data, opt),
    updateIsSelected: (data, opt) => ipcRenderer.invoke('testCase:updateIsSelected', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('testCase:delete', data, opt)
  },
  systemStandard: {
    find: (data, opt) => ipcRenderer.invoke('systemStandard:find', data, opt),
    findVersions: (data, opt) => ipcRenderer.invoke('systemStandard:findVersions', data, opt),
    findPrinciples: (data, opt) => ipcRenderer.invoke('systemStandard:findPrinciples', data, opt),
    findGuidelines: (data, opt) => ipcRenderer.invoke('systemStandard:findGuidelines', data, opt),
    findCriteria: (data, opt) => ipcRenderer.invoke('systemStandard:findCriteria', data, opt)
  },
  technology: {
    find: (data, opt) => ipcRenderer.invoke('technology:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('technology:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('technology:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('technology:update', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('technology:delete', data, opt)
  },
  remediation: {
    find: (data, opt) => ipcRenderer.invoke('remediation:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('remediation:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('remediation:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('remediation:update', data, opt),
    updateIsSelected: (data, opt) => ipcRenderer.invoke('remediation:updateIsSelected', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('remediation:delete', data, opt)
  },
  systemCategory: {
    find: (data, opt) => ipcRenderer.invoke('systemCategory:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('systemCategory:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('systemCategory:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('systemCategory:update', data, opt),
    updateIsSelected: (data, opt) => ipcRenderer.invoke('systemCategory:updateIsSelected', data, opt),
    updatePriority: (data, opt) => ipcRenderer.invoke('systemCategory:updatePriority', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('systemCategory:delete', data, opt)
  },
  systemEnvironment: {
    find: (data, opt) => ipcRenderer.invoke('systemEnvironment:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('systemEnvironment:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('systemEnvironment:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('systemEnvironment:update', data, opt),
    updateIsSelected: (data, opt) => ipcRenderer.invoke('systemEnvironment:updateIsSelected', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('systemEnvironment:delete', data, opt)
  },
  axeCore: {
    getAxeScript: () => ipcRenderer.invoke('test:getScript'),
    getRunScript: () => ipcRenderer.invoke('test:runScript'),
    handleResult: data => ipcRenderer.invoke('test:handleResult', data)
  },
  profile: {
    find: (data, opt) => ipcRenderer.invoke('profile:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('profile:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('profile:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('profile:update', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('profile:delete', data, opt)
  },
  systemCountry: {
    find: (data, opt) => ipcRenderer.invoke('systemCountry:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('systemCountry:read', data, opt)
  },
  accessibilitySettings: {
    read: () => ipcRenderer.invoke('accessibilitySettings:read'),
    update: data => ipcRenderer.invoke('accessibilitySettings:update', data),
    reset: data => ipcRenderer.invoke('accessibilitySettings:reset', data)
  },
  pageScripts: {
    getFocusScript: (data, opt) => ipcRenderer.invoke('pageScripts:getFocusScript', data, opt),
    getRemoveFocusScript: (data, opt) => ipcRenderer.invoke('pageScripts:getRemoveFocusScript', data, opt)
  },
  audit: {
    find: (data, opt) => ipcRenderer.invoke('audit:find', data, opt),
    read: (data, opt) => ipcRenderer.invoke('audit:read', data, opt),
    create: (data, opt) => ipcRenderer.invoke('audit:create', data, opt),
    update: (data, opt) => ipcRenderer.invoke('audit:update', data, opt),
    delete: (data, opt) => ipcRenderer.invoke('audit:delete', data, opt),
    findAuditReportItems: (data, opt) => ipcRenderer.invoke('audit:findAuditReportItems', data, opt),
    updateAuditReportItem: (data, opt) => ipcRenderer.invoke('audit:updateAuditReportItem', data, opt),
    findAuditTypes: (data, opt) => ipcRenderer.invoke('audit:findAuditTypes', data, opt),
    findAuditChapters: (data, opt) => ipcRenderer.invoke('audit:findAuditChapters', data, opt),
    getStats: (data, opt) => ipcRenderer.invoke('audit:getStats', data, opt),
    generateReport: (data, opt) => ipcRenderer.invoke('audit:generateReport', data, opt)
  }
};

const system = {
  platform: process.platform,
  exit: () => ipcRenderer.invoke('system:exit'),
  acceptEula: () => ipcRenderer.invoke('system:acceptEula'),
  getAssetsPath: () => ipcRenderer.invoke('system:getAssetsPath'),
  log: {
    error: message => ipcRenderer.send('log:error', message),
    rejection: message => ipcRenderer.send('log:rejection', message)
  }
};

ipcRenderer.on('log:error', (_, error) => {
  log.error('Error from Renderer');
  log.error(error);
});

ipcRenderer.on('log:rejection', (_, reason) => {
  log.error('Unhandled Promise Rejection from Renderer');
  log.error(reason);
});

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
    contextBridge.exposeInMainWorld('system', system);
  } catch (error) {
    log.error(error);
  }
} else {
  window.api = api;
}
