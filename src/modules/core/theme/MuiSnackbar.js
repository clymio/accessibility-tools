'use strict';

export default palette => ({
  MuiSnackbar: {
    styleOverrides: {
      root: {
        zIndex: 9500
      }
    }
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        cursor: 'default'
      },
      standardSuccess: {
        backgroundColor: palette.success.main,
        color: palette.primary.contrastText,
        svg: {
          color: palette.primary.contrastText
        }
      },
      standardError: {
        backgroundColor: palette.error.main,
        color: palette.primary.contrastText,
        svg: {
          color: palette.primary.contrastText
        }
      }
    }
  }
});
