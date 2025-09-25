'use strict';
export default palette => ({
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      fullWidth: true,
      autoComplete: 'off'
    },
    styleOverrides: {
      root: {
        '.MuiInputBase-colorSuccess:not(.Mui-error)': {
          fieldset: {
            borderColor: palette.secondary.main
          },
          '.MuiInputAdornment-root svg': {
            color: palette.secondary.main
          }
        },
        '.MuiInputBase-root.Mui-error': {
          fieldset: {
            borderColor: `${palette.error.main} !important`
          },
          svg: {
            color: palette.error.main
          }
        },
        '.MuiInputAdornment-root svg': {
          color: palette.primary.main
        },
        '&.MuiFormControl-root': {
          backgroundColor: 'transparent'
        },
        '.MuiFormHelperText-root': {
          color: palette.text.secondary,
          '&.Mui-error': {
            color: palette.error.main
          }
        },
        '&::placeholder': {
          color: palette.secondary.muted
        },
        marginTop: 36,
        '.MuiInputLabel-root': {
          top: -20,
          color: palette.text.main,
          borderRadius: palette.radius
          // left: -12
        },
        '.MuiInputBase-input': {
          fontSize: '14px',
          overflow: 'auto',
          borderRadius: palette.radius,
          backgroundColor: palette.input.background,
          '&::placeholder': {
            fontSize: '14px',
            color: palette.text.footer,
            opacity: 1
          },
          '&::focus': {
            border: 'none',
            borderRadius: palette.radius
          },
          // disabled
          '&.Mui-disabled': {
            color: palette.input.main,
            WebkitTextFillColor: palette.input.main
          }
        }
      }
    }
  }
});
