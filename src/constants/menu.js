import { clipboardCheck, clipboardList, folders, gear, screwdriverWrench } from '@/assets/icons';

/**
 * Builds the menu items for a given module.
 *
 * @param {{ url: String, name: String, title: String }} module - The module object containing the URL, name, and title.
 * @returns {{ icon: Icon, title: String, url: String, exact?: Boolean, footer?: Boolean }[]} - An array of menu items.
 * Each menu item is an object with the following properties:
 * - icon: The icon component for the menu item.
 * - title: The title of the menu item.
 * - url: The URL for the menu item.
 * - exact: (optional) A boolean indicating whether the menu item should match the exact URL.
 * - footer: (optional) A boolean indicating whether the menu item should be displayed in the footer.
 */
export function buildMenu(module) {
  const res = [];
  res.push({
    icon: folders,
    title: 'Projects',
    url: module.url,
    exact: true
  });
  res.push({
    icon: clipboardList,
    title: 'Audits',
    url: `${module.url}audits`
  });
  res.push({
    icon: clipboardCheck,
    title: 'Test cases',
    url: `${module.url}testCases`
  });
  res.push({
    icon: screwdriverWrench,
    title: 'Remediations',
    url: `${module.url}remediations`
  });
  res.push({
    icon: gear,
    title: 'Settings',
    url: `${module.url}settings`,
    footer: true
  });
  return res;
}

const APP_MODULES = {
  admin: {
    url: '/',
    name: 'default',
    title: 'Clym',
    getMenu: buildMenu
  }
};

export function getAppModule() {
  // change later when we have more modules
  return APP_MODULES.admin;
}
