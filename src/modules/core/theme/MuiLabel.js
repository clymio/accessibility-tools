'use strict';

export default palette => ({
  MuiFormLabel: {
    styleOverrides: {
      root: {
        color: palette.primary.main,
        fontWeight: 400,
        fontSize: 14,
        '&.Mui-focused.MuiFormLabel-colorPrimary:not(.Mui-error)': {
          color: palette.label.active
        }
      }
    }
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        '.MuiFormControlLabel-label': {
          lineHeight: '1rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }
      }
    }
  }
});
