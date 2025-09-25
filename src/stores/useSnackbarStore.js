import { create } from 'zustand';

const initialState = {
  open: false,
  message: '',
  severity: 'error',
  variant: 'filled',
  autoHideDuration: 6000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
};

export const useSnackbarStore = create(set => ({
  ...initialState,
  onClose: () => {
    set({ ...initialState });
  },
  openSnackbar: ({ message = '', severity = 'error', variant = 'filled', autoHideDuration = 6000, anchorOrigin = { vertical: 'bottom', horizontal: 'center' } }) => {
    set({ open: true, message: message, severity, variant, autoHideDuration });
  }
}));
