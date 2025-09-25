exports.default = async function notarizing(context) {
  if (process.env.SKIP_NOTARIZATION) return;
  require('dotenv').config();
  if (context.electronPlatformName !== 'darwin') return;

  const { notarize } = await import('@electron/notarize');

  const appId = 'io.clym.dev-tools';

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${context.appOutDir}/${appName}.app`;

  console.log('Notarizing app...');
  await notarize({
    appBundleId: appId,
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  });
  console.log('Notarization completed.');
};
