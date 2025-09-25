'use strict';
import { Badge } from '@mui/material';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import { forwardRef } from 'react';
import styles from './IconButton.module.scss';

import {
  dollarSign,
  download,
  edit2,
  eye,
  filter,
  moon,
  moreHorizontal,
  playCircle,
  search,
  share,
  share2,
  sun,
  trash,
  moreVertical,
  xIcon,
  link,
  info
} from '@/assets/icons';

const ICON_MAP = {
  edit: edit2,
  delete: trash,
  view: eye,
  price: dollarSign,
  link: link,
  download: download,
  more: moreHorizontal,
  play: playCircle,
  share: share2,
  browser: share,
  info: info,
  lightMode: sun,
  darkMode: moon,
  filter: filter,
  search: search,
  close: xIcon,
  moreVert: moreVertical
};

const IconButton = forwardRef(({ Icon, tooltip, badge, className, ...rest }, ref) => {
  let IconComponent = null;

  if (typeof Icon === 'string') {
    IconComponent = ICON_MAP[Icon];
  } else if (typeof Icon === 'function' || typeof Icon === 'object') {
    IconComponent = Icon;
  }

  const btn = (
    <Button
      className={classNames(styles.root, className)}
      variant='outlined'
      endIcon={IconComponent ? <IconComponent /> : null}
      {...rest}
    />
  );

  if (!tooltip && !badge) return btn;

  if (tooltip && !badge) {
    return (
      <Tooltip
        title={tooltip}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 0 }}
        placement='top'
      >
        <span style={{ display: 'inline-block' }}>{btn}</span>
      </Tooltip>
    );
  }

  if (badge && !tooltip) {
    return (
      <Badge
        variant='dot'
        color='error'
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <span style={{ display: 'inline-block' }}>{btn}</span>
      </Badge>
    );
  }

  return (
    <Tooltip
      title={tooltip}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 0 }}
      placement='top'
    >
      <Badge
        variant='dot'
        color='error'
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <span style={{ display: 'inline-block' }}>{btn}</span>
      </Badge>
    </Tooltip>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
