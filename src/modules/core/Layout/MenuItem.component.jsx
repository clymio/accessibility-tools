'use strict';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import style from './Menu.module.scss';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@/modules/core/Icon';

export default function MenuItem({ title, icon, iconProps = {}, url, match, exact = false, router = {}, shouldLoad }) {
  const [isVisible, setIsVisible] = useState(typeof shouldLoad !== 'function');
  const checkLoad = async (fn) => {
    try {
      let visible = await fn();
      if (visible) setIsVisible(true);
    } catch (e) {
      //
    }
  };
  useEffect(() => {
    if (typeof shouldLoad !== 'function') return;
    checkLoad(shouldLoad);
  }, [shouldLoad]);
  const currentPath = usePathname();
  const isActive = isSelected(currentPath, match || url, exact);
  const href = getHrefs(router, url);
  const iconToRender = <Icon icon={icon} />;
  if (!isVisible) return <></>;
  return (
    <Link href={url} legacyBehavior>
      <Tooltip title={title} placement='right'>
        <a
          href={href[0]}
          className={classNames(style.item, {
            [style.itemActive]: isActive
          })}
        >
          {iconToRender}
          {isActive && <span className={style.activeBar} />}
        </a>
      </Tooltip>
    </Link>
  );
}

function isSelected(current, targets, exactMatch = false) {
  if (!(targets instanceof Array)) targets = [targets];
  for (let i = 0, len = targets.length; i < len; i++) {
    let target = targets[i];
    if (current === target) return true;
    if (target === '/') continue;
    if (exactMatch) continue;
    if (current?.indexOf(target) === 0) {
      return true;
    }
  }
  return false;
}

// replace :param_name with data from query.
function getHrefs(router, urls) {
  if (!(urls instanceof Array)) urls = [urls];
  let res = [];
  for (let i = 0, len = urls.length; i < len; i++) {
    if (typeof urls[i] !== 'string') continue;
    let u = urls[i];
    Object.keys(router.query || {}).forEach((k) => {
      u = u.split(`:${k}`).join(router.query[k]);
    });
    res.push(u);
  }
  return res;
}
