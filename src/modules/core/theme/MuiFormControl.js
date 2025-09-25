'use strict';
export default palette => ({
  MuiFormControl: {
    styleOverrides: {
      root: {
        '&:not(.MuiTextField-root)': {
          marginTop: 36
        },
        '& .MuiInputLabel-root': {
          transform: 'translate(6px, -6px); scale(1)',
          fontWeight: 500,
          color: palette.label.main,
          fontSize: 14,
          '&.Mui-error': {
            color: palette.error.main
          }
        }
      }
    }
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginLeft: 5,
        color: palette.text.secondary,
        '&.Mui-error': {
          color: palette.error.main
        },
        cursor: 'default',
        lineHeight: '14px'
      }
    }
  }
});
