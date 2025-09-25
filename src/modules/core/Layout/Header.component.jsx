'use strict';
import { HEADER_HEIGHT } from '@/constants/app';
import classNames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import style from './Header.module.scss';
export default function CoreHeader({ className }) {
  const [platform, setPlatform] = useState();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPlatform(window.system.platform);
    }
  }, []);
  return (
    <Fragment>
      <header
        className={classNames(style.root, className, {
          [style.draggable]: platform === 'darwin'
        })}
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div>{/* to simulate the left side of the header with the close buttons */}</div>
        {/* <Search /> */}
      </header>
    </Fragment>
  );
}
