'use strict';
export default palette => ({
  MuiOutlinedInput: {
    defaultProps: {
      size: 'small'
    },
    styleOverrides: {
      input: {
        color: palette.input.main,
        borderRadius: palette.shape.borderRadius,
        padding: '9.5px 14px',
        overflow: 'hidden',
        backgroundColor: palette.input.background
      },
      root: {
        backgroundColor: palette.input.background,
        '& .Mui-disabled': {
          backgroundColor: palette.input.disabled,
          borderWidth: 0,
          'input::placeholder': {
            color: palette.input.disabledText,
            webkitTextFillColor: palette.input.disabledText
          }
        },
        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          border: 'none !important'
        },

        '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
          boxShadow: 'none',
          borderWidth: 2,
          borderColor: palette.primary.main
        },
        '&.Mui-focused:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
          borderWidth: 2,
          borderColor: palette.primary.main
        },
        '&.MuiInputBase-multiline': {
          padding: 0
        },
        '&:hover fieldset': {
          border: '1px solid ' + palette.primary.main + '!important'
        }
      },
      '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
        border: '1px solid ' + palette.primary.main + '!important'
      },
      notchedOutline: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: palette.shape.borderRadius,
        legend: {
          maxWidth: 0,
          backgroundColor: 'transparent'
        }
      }
    }
  }
});
