'use strict';
import classNames from 'classnames';
import style from './Loading.module.scss';

export default function LoadingBox({
  className,
  size // can be large
}) {
  return (
    <div className={classNames(style.icon, className, style[size])} />
  );
}
