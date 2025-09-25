'use strict';
import { Typography } from '@mui/material';
import classNames from 'classnames';
import { Fragment } from 'react';
import style from './Footer.module.scss';
export default function CoreFooter({ className }) {
  return (
    <Fragment>
      <footer className={classNames(style.root, className)}>
        <Typography>This is a footer</Typography>
      </footer>
    </Fragment>
  );
}
