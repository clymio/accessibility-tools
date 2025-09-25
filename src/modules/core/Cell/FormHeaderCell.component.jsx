'use strict';
import { useUiStore } from '@/stores';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { Fragment } from 'react';
import style from './Cell.module.scss';

export default function FormHeaderCellComponent({ label = '', helperText = '', className, helperClassName, sx, ...rest }) {
  const { theme } = useUiStore();
  sx = {
    marginLeft: 0,
    marginTop: 20,
    marginBottom: 0,
    ...(sx || {})
  };
  return (
    <Fragment>
      <Typography color={theme.palette.label.main} className={classNames(style.formHeader, className)} style={sx} {...rest} variant='body1'>
        {label}
      </Typography>
      {helperText && (
        <Typography color={theme.palette.primary.main} className={classNames(style.formSubHeader, helperClassName)} variant='body2'>
          {helperText}
        </Typography>
      )}
    </Fragment>
  );
}
