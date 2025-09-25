import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import styles from './Dialog.module.scss';
import { xIcon } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

const renderDefaultActions = (actionsConfig, handleClose, nextRef = null) => {
  if (!actionsConfig) return null;

  const {
    disabled = false,
    isSubmitting = false,
    onBack,
    nextLabel = '',
    backLabel = '',
    isDelete = false
  } = actionsConfig;

  if (isDelete) {
    return (
      <>
        <Button onClick={handleClose} variant='outlined' className={styles.cancelBtn}>
          <Typography variant='body1'>Cancel</Typography>
        </Button>
        <Button type='submit' variant='contained' color='error' disabled={disabled || isSubmitting} className={styles.deleteBtn} ref={nextRef}>
          {isSubmitting && <CircularProgress className={styles.progressSpinner} color='inherit' size={16} />}
          <Typography variant='body1'>{nextLabel ? nextLabel : 'Delete'}</Typography>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button type='submit' variant='contained' disabled={disabled || isSubmitting} className={styles.submitBtn} ref={nextRef}>
        {isSubmitting && <CircularProgress className={styles.progressSpinner} color='inherit' size={16} />}
        <Typography variant='body1'>
          {nextLabel}
        </Typography>
      </Button>
      <Button onClick={onBack} className={styles.backBtn}>
        <Typography variant='body1'>
          {backLabel}
        </Typography>
      </Button>
    </>
  );
};

export default function CoreDialog({
  open = false,
  title = '',
  titleIcon = null,
  children = null,
  actions = null,
  actionsConfig = null,
  nextRef = null,
  maxWidth = 'sm',
  fullWidth = true,
  className = '',
  dialogHeaderClassName = '',
  dialogContentClassName = '',
  dialogActionsClassName = '',
  dialogContainerClassName = '',
  dialogContentContainer = '',
  dialogFormClassName = '',
  PaperProps = {},
  onClose = () => {},
  onSubmit = () => {},
  triggerEl = null
}) {
  const triggerRef = useRef(triggerEl);

  useEffect(() => {
    if (!triggerEl) return;
    triggerRef.current = triggerEl;
  }, [triggerEl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleBlur();
    onSubmit(e);
  };

  const handleClose = (e) => {
    handleBlur();
    onClose(e);
  };

  const handleBlur = () => {
    if (typeof document !== 'undefined') {
      const active = document.activeElement;
      if (active && active instanceof HTMLElement) {
        active.blur();
      }
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      keepMounted={false}
      className={classNames(styles.coreDialog, className)}
      classes={{ container: dialogContainerClassName }}
      PaperProps={{
        ...PaperProps,
        className: classNames(PaperProps.className, styles.dialog)
      }}
      onClose={onClose}
      disableRestoreFocus
      TransitionProps={{
        onExited: () => {
          if (triggerRef.current) {
            triggerRef.current.focus();
          }
        }
      }}
    >
      <div className={classNames(styles.dialogContentContainer, dialogContentContainer)}>
        <form onSubmit={handleSubmit} className={classNames(dialogFormClassName, { [styles.delete]: dialogFormClassName === 'delete' })}>

          <DialogTitle className={classNames(dialogHeaderClassName)}>
            {titleIcon && titleIcon}
            {title && <Typography align='center'>{title}</Typography>}
          </DialogTitle>
          <DialogContent className={classNames(dialogContentClassName)}>{children}</DialogContent>
          <DialogActions className={classNames(styles.dialogActions, dialogActionsClassName, { [styles.delete]: dialogFormClassName === 'delete' })}>
            {actions || renderDefaultActions(actionsConfig, handleClose, nextRef)}
          </DialogActions>
          <IconButton className={styles.closeDialogButton} aria-label='Close dialog' onClick={handleClose} edge='end'>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={xIcon} />
          </IconButton>
        </form>
      </div>
    </Dialog>
  );
}
