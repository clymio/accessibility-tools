'use strict';
import { HEADER_HEIGHT } from '@/constants/app';
import { getAppModule } from '@/constants/menu';
import { useUiStore } from '@/stores';
import { Button } from '@mui/material';
import { Fragment } from 'react';
import FileExplorer from './FileExplorer.component';
import Header from './Header.component';
import style from './Layout.module.scss';
import Menu from './Menu.component';
import RightDrawer from './RightDrawer.component';
import Terminal from './Terminal.component';
import classNames from 'classnames';

function CoreLayout({
  router = {},
  menu = null, // a custom array of menu items to use. If not set, we will build it based on the module we're in.
  showFileExplorer = false,
  showTerminal = false,
  showRightDrawer = false,
  removeContentPadding = false,
  page = null // The React page component to render in this layout.
}) {
  const { isResizing, rightDrawerSettings } = useUiStore();
  const app = getAppModule(router?.fullPath);
  if (!app) return <Fragment />;
  if (!menu && app.getMenu) {
    menu = app.getMenu(app) || null;
  }
  const PageComponent = page || null;
  const drawerWidth
    = rightDrawerSettings.isOpen || rightDrawerSettings.isAnimating
      ? rightDrawerSettings.drawerWidth
      : 0;

  return (
    <div className={style.root} style={{ '--top-margin': `${HEADER_HEIGHT}px` }}>
      <Button href='#mainContent' variant='contained' className={style.skipBtn}>Skip to main content</Button>
      <Header router={router} module={app} />
      <div className={style.middle}>
        {menu && <Menu router={router} items={menu} />}
        {showFileExplorer && <FileExplorer id='mainContent' />}
        <main className={style.content} id={!showFileExplorer ? 'mainContent' : ''} tabIndex={-1} style={{ pointerEvents: isResizing ? 'none' : 'all', ...(removeContentPadding ? { padding: 0 } : {}) }}>
          <div
            className={classNames(style.contentInner, { [style.scaled]: rightDrawerSettings.isAnimating })}
            style={{
              marginRight: drawerWidth
            }}
          >
            {PageComponent && (
              <div className={style.page}>
                <PageComponent />
              </div>
            )}
            {showTerminal && <Terminal />}
          </div>
          {showRightDrawer && <RightDrawer />}
        </main>
      </div>
    </div>
  );
}

export default CoreLayout;
