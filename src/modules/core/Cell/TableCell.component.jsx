'use strict';
import style from './Cell.module.scss';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';

export default function TableCell({
  name = '',
  value = '',
  valueClassName,
  nameClassName
}) {
  return (
    <div className={style.tableCell}>
      <Typography className={classNames(style.value, valueClassName)} color='label.main' variant='body1'>{value}</Typography>
      <Typography className={classNames(style.name, nameClassName)} color='secondary.muted' variant='body2'>{name}</Typography>
    </div>
  );
}
