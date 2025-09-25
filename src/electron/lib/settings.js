import fs from 'fs-extra';
import path from 'path';
import { getModel } from './db';

const SETTINGS_DEFAULT_ID = 1;
const ACCESSIBILITY_SETTINGS_DEFAULT_ID = 1;
const ARCHIVES_FOLDER_NAME = 'archives';

export const ARCHIVE_TYPES = {
  TEST: 'test'
};

class SettingsLib {
  static async init(data_directory_path) {
    const Settings = getModel('settings'), AccessibilitySettings = getModel('accessibilitySettings');

    await Settings.upsert({ id: SETTINGS_DEFAULT_ID, data_directory_path });
    await AccessibilitySettings.upsert({ id: ACCESSIBILITY_SETTINGS_DEFAULT_ID });

    // if archive folder and subfolders don't exist, create them
    const archivePath = path.join(data_directory_path, ARCHIVES_FOLDER_NAME);
    if (!fs.existsSync(archivePath)) {
      fs.mkdirSync(archivePath);
    }
    for (const type in ARCHIVE_TYPES) {
      const archiveTypePath = path.join(archivePath, ARCHIVE_TYPES[type]);
      if (!fs.existsSync(archiveTypePath)) {
        fs.mkdirSync(archiveTypePath);
      }
    }
  }

  static async getObject() {
    const Settings = getModel('settings');
    const settings = await Settings.findByPk(SETTINGS_DEFAULT_ID);
    return settings;
  }

  static async read() {
    const settings = await this.getObject();
    return settings.toJSON();
  }

  static async getArchiveTypeFolderPath(type) {
    const settings = await this.getObject();
    return path.join(settings.data_directory_path, ARCHIVES_FOLDER_NAME, type);
  }
}

export default SettingsLib;
