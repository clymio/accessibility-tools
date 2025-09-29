'use strict';
import { chevronUp } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { Chip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { BulletCell } from '../Cell';
import styles from './Accordion.module.scss';

export default function CoreAccordion({
  title,
  titleComponent = null,
  expanded = false,
  error = false,
  group = false,
  bullet = null,
  disabled,
  disableSummaryClick = false,
  rightElement,
  rightElementClassName,
  chipText,
  rightLabel,
  hideRightLabel = false,
  rightIcon = true,
  isChildAccordion = false,
  onClick,
  className,
  summaryClassName,
  summaryRef,
  detailsClassName,
  children,
  onChange,
  sx = {}
}) {
  const [open, setOpen] = useState(expanded);
  const handleChange = (e, ex) => {
    if (disabled || disableSummaryClick) return;
    if (onClick) return onClick(ex);
    if (!group) setOpen(ex);
    onChange && onChange(ex);
  };
  useEffect(() => {
    if (!group) return;
    setOpen(expanded);
  }, [expanded, group]);
  return (
    <Accordion
      className={classNames(className, styles.root, {
        [styles.error]: error,
        [styles.disabled]: disabled
      })}
      onChange={handleChange}
      expanded={open}
      sx={sx}
    >
      <AccordionSummary
        ref={summaryRef}
        className={classNames(
          styles.summary,
          {
            [styles.isChildAccordion]: isChildAccordion
          },
          summaryClassName
        )}
        expandIcon={rightIcon ? <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={chevronUp} /> : undefined}
        onClick={disableSummaryClick ? e => e.stopPropagation() : undefined}
      >
        {titleComponent || (
          <div className={styles.summaryTitle}>
            <Typography variant='body1' component='div' fontWeight={600}>
              {bullet && <BulletCell className={styles.bullet} color={bullet} />}
              {title}
            </Typography>
          </div>
        )}
        <div className={classNames(styles.rightContainer, rightElementClassName)}>
          {chipText && <Chip variant='outlined' label={chipText} className={styles.chip} />}
          {!disabled && (
            <span
              className={classNames(styles.toggleText, {
                [styles.toggleTextNoIcon]: !rightIcon
              })}
            >
              {hideRightLabel ? '' : rightLabel ? rightLabel : open ? 'Hide' : 'Display'}
            </span>
          )}
          {rightElement}
        </div>
      </AccordionSummary>
      {children && <AccordionDetails className={detailsClassName}>{children}</AccordionDetails>}
    </Accordion>
  );
}
