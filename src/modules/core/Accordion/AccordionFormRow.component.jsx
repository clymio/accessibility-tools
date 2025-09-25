'use strict';
import styles from './AccordionForm.module.scss';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';

export default function AccordionFormRow({
  title,
  titleChip,
  className,
  actions,
  extended,
  hover,
  light,
  children,
  onHover,
  tableRow
}) {
  const divProps = {};
  if (onHover) {
    divProps.onMouseEnter = e => onHover(true, e);
    divProps.onMouseLeave = e => onHover(false, e);
  }
  return (
    <div
      className={classNames(className, styles.item, {
        [styles.hover]: hover,
        [styles.light]: light,
        [styles.extended]: extended,
        [styles.tableRow]: tableRow
      })}
      {...divProps}
    >
      <div>
        <div>
          <Typography component='div' variant='body1'>{title}</Typography>
          {titleChip && (
            <>
              &nbsp;
              {titleChip}
            </>
          )}
        </div>
        <div className={styles.itemActions}>
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}
