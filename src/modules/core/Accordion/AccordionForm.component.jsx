'use strict';
import { useUiStore } from '@/stores';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import Loading from '../Loading';
import styles from './AccordionForm.module.scss';
import AccordionSkeleton from './AccordionSkeleton.component';
import { chevronDown } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

export default function AccordionForm({
  title,
  subTitle = '',
  Icon = null,
  alwaysRender = true,
  expanded = false,
  loading = false,
  disabled = false,
  group = false,
  ready = true,
  actions,
  className,
  children,
  helpLink,
  helpLabel = 'Help',
  subPath, // if set, we append the path to the router's .asPath
  basePath, // if set, we use this when changing the URL.
  onChange,
  onOpen
}) {
  const { theme } = useUiStore();
  const router = useRouter();
  const [open, setOpen] = useState(expanded);
  useEffect(() => {
    if (!subPath) return;
    const isOpen = changeSubPath(router, subPath, basePath);
    if (open !== isOpen) {
      setOpen(isOpen);
    }
  }, [subPath, basePath, expanded, router.asPath]);
  const handleChange = (e, ex) => {
    if (!group) setOpen(ex);
    onChange && onChange(ex);
    changeSubPath(router, subPath, basePath, ex);
    if (onOpen && ex) onOpen();
  };
  useEffect(() => {
    if (!group) return;
    setOpen(expanded);
  }, [expanded, group]);
  let shouldRender = true;
  if (!alwaysRender && !open) shouldRender = false;
  if (disabled === true) return <></>;
  return (
    <Accordion
      className={classNames(className, styles.root, {
        [styles.opened]: open
      })}
      onChange={handleChange}
      expanded={open}
    >
      <AccordionSummary disabled={disabled || loading} className={styles.summary} expandIcon={loading ? <Loading /> : <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={chevronDown} />}>
        {Icon && (
          <div className={styles.icon}>
            <Icon color={theme.palette.primary.contrastText} />
          </div>
        )}
        <div>
          <Typography variant='body1' className={styles.title}>
            {title}
          </Typography>
          <Typography variant='body2' className={styles.subTitle}>
            {subTitle}
          </Typography>
        </div>
      </AccordionSummary>
      {shouldRender
        ? (
          <AccordionDetails className={styles.content}>
            {ready
              ? (
                <Fragment>
                  {children}
                  {actions && <div className={styles.actions}>{actions}</div>}
                  {loading && <div className={styles.blocked} />}
                </Fragment>
                )
              : (
                <AccordionSkeleton />
                )}
          </AccordionDetails>
          )
        : (
          <div style={{ height: 30 }}></div>
          )}
      {helpLabel && helpLink && (
        <div className={styles.help}>
          <a href={helpLink} target='_blank'>
            {helpLabel}
          </a>
        </div>
      )}
    </Accordion>
  );
}

function changeSubPath(router, subPath, basePath, isOpen) {
  if (!router || !subPath) return;
  const subPaths = router.asPath.split('?')[0].split('#')[0].split('/');
  if (subPath.charAt(0) === '/') subPath = subPath.substr(1);
  const isOnPath = subPaths.indexOf(subPath) !== -1;
  if (typeof isOpen === 'undefined') isOpen = isOnPath;
  let newPath;
  if (isOpen && !isOnPath) {
    newPath = basePath + `/${subPath}`;
  } else if (!isOpen && isOnPath) {
    newPath = basePath;
  }
  if (newPath) {
    router.replace(newPath, newPath, { getServerSideProps: true });
  }
  return isOnPath;
}
