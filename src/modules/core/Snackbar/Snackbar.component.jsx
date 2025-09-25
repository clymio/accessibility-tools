import styles from './Snackbar.module.scss';
import { Snackbar as MuiSnackbar, Alert, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useSnackbarStore } from '@/stores';

const Snackbar = () => {
  const {
    open = false,
    message = '',
    severity = 'error',
    variant = 'filled',
    autoHideDuration = 6000,
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
    onClose = () => {}
  } = useSnackbarStore();

  const handleSnackbarClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <MuiSnackbar
      className={styles.root}
      open={open}
      onClose={handleSnackbarClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={handleSnackbarClose} severity={severity} variant={variant}>
        <Typography>{message}</Typography>
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar;
