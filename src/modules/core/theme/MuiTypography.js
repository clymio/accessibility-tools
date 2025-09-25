'use strict';
import { lighten } from '@mui/material/styles';

export default palette => ({
  MuiTypography: {
    defaultProps: {
      variant: 'body2'
    },
    styleOverrides: {
      section: {
        fontFamily: 'var(--font-roboto-mono),Arial,sans-serif',
        fontSize: '24px'
      },
      h1: {
        fontSize: '30px',
        fontWeight: 'bold'
      },
      subtitle: {
        fontSize: '20px',
        fontFamily: 'var(--font-roboto-mono),Arial,sans-serif',
        color: '#00F279'
      },
      title: {
        fontSize: '34px',
        fontFamily: 'var(--font-roboto),Arial,sans-serif',
        fontWeight: 'bold'
      },
      body1: {
        fontSize: '16px'
      },
      body2: {
        fontSize: '14px'
      },
      caption: {
        fontSize: '12px'
      },
      root: {
        fontFamily: 'var(--font-roboto),Arial,sans-serif',
        color: palette.text.main,
        fontWeight: 'inherit'
      }
    }
  }
});
