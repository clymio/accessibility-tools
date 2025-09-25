'use strict';
import styles from './Cell.module.scss';
import classNames from 'classnames';
import Tooltip from '@mui/material/Tooltip';

export default function BulletCell({
  color,
  style,
  tooltip,
  className
}) {
  const blt = (
    <span
      className={classNames('MuiBullet-root', className, styles.bullet)}
      style={{
        backgroundColor: color || 'transparent',
        ...style || {}
      }}
    />
  );
  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement='top'>
        {blt}
      </Tooltip>
    );
  }
  return blt;
}
