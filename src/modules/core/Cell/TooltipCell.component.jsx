'use strict';
import Tooltip from '@mui/material/Tooltip';
import styles from './Cell.module.scss';
import { info } from '@/assets/icons';

export default function TooltipCell({
  icon,
  color,
  className,
  title = ''
}) {
  const TooltipIcon = icon || info;
  return (
    <Tooltip className={className} title={title} arrow={true} placement='top'>
      <TooltipIcon color={color} className={styles.tooltipIcon} />
    </Tooltip>
  );
}
