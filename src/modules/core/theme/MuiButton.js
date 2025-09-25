'use strict';
import { lighten } from '@mui/material/styles';

export default palette => ({
  MuiButton: {
    defaultProps: {
      variant: 'contained'
    },
    styleOverrides: {
      root: {
        height: '33px',
        fontFamily: 'var(--font-roboto-mono),Arial,sans-serif',
        fontSize: '12px',
        borderRadius: palette.radius,
        boxShadow: 'none',
        textTransform: 'uppercase',
        fontWeight: 500,
        '&:hover': {
          boxShadow: 'none'
        },
        '& .MuiButton-endIcon': {
          marginLeft: 0
        },
        '&:disabled': {
          color: palette.input.disabled,
          backgroundColor: palette.background.disabled
        },
        padding: '8px 24px',
        '&.MuiButton-text': {
          background: 'transparent',
          padding: 0,
          '&:hover': {
            backgroundColor: 'transparent'
          }
        }
      },
      outlined: {
        height: '33px',
        border: '2px solid' + palette.primary.main,
        textTransform: 'uppercase',
        padding: '4px 16px',
        '&:hover': {
          borderWidth: '2px',
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText
        },
        '&.MuiButton-outlinedError': {
          border: '2px solid ' + palette.error.main,
          '&:hover': {
            backgroundColor: palette.error.main
          }
        }
      },
      text: {
        color: palette.text.secondary,
        '&.MuiButton-textError': {
          color: palette.error.main
        }
      },
      containedPrimary: {
        '&:hover': {
          backgroundColor: lighten(palette.primary.main, 0.2)
        }
      }
    }
  }
});
