'use strict';
export default palette => ({
  MuiInputLabel: {
    defaultProps: {
      shrink: true
    },
    styleOverrides: {
      root: {
        fontWeight: 400,
        fontSize: 14,
        '&.MuiInputLabel-root': {
          top: -16,
          left: -4,
          color: palette.input.label
        },
        '&.Mui-focused.MuiFormLabel-colorPrimary:not(.Mui-error)': {
          color: palette.label.active
        }
      }
    }
  }
});
