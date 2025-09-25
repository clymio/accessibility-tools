const { BUCKET_URL } = require('./config/bucket.js');

const ARTIFACT_NAME = '${name}_setup.${ext}';

module.exports = {
  asar: true,
  executableName: 'Accessibility Tools',
  appId: 'io.clym.dev-tools',
  publish: {
    provider: 'generic',
    url: BUCKET_URL
  },
  extraResources: [
    {
      from: 'node_modules/axe-core/axe.min.js',
      to: 'axe.min.js'
    },
    {
      from: 'public/assets',
      to: 'assets',
      filter: ['**/*']
    }
  ],
  directories: {
    output: 'dist'
  },
  asarUnpack: [
    'node_modules/sqlite3/**',
    'node_modules/@rollup/rollup-darwin-arm64/**',
    'node_modules/@parcel/watcher-darwin-arm64/**',
    'node_modules/@next/swc-darwin-arm64/**',
    'node_modules/iconv-corefoundation/**',
    '**/*.{node,dll}'
  ],
  files: [
    'build',
    {
      from: '.next/standalone',
      to: 'app',
      filter: ['!**/.env', '!**/package.json']
    },
    {
      from: '.next/static',
      to: 'app/.next/static'
    }
  ],
  win: {
    target: ['nsis'],
    artifactName: ARTIFACT_NAME,
    ...(process.env.NODE_ENV === 'production'
      ? {
          signtoolOptions: {
            signingHashAlgorithms: ['sha256'],
            certificateSubjectName: 'Clym Inc.',
            rfc3161TimeStampServer: 'http://timestamp.digicert.com'
          }
        }
      : {}),
    icon: 'public/assets/icon.ico'
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  linux: {
    target: ['default'],
    category: 'Development',
    icon: 'public/assets/icons/'
  },
  mac: {
    target: ['default'],
    type: 'distribution',
    category: 'public.app-category.developer-tools',
    icon: 'public/assets/icon.icns',
    artifactName: ARTIFACT_NAME,
    hardenedRuntime: true,
    entitlements: './config/entitlements.mac.plist',
    entitlementsInherit: './config/entitlements.mac.plist',
    gatekeeperAssess: false,
    notarize: false
  },
  ...(process.env.NODE_ENV === 'production'
    ? {
        afterSign: './config/notarize.js'
      }
    : {})
};
