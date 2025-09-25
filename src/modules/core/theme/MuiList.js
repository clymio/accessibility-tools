'use strict';
import { lighten } from '@mui/material/styles';

export default palette => ({
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 40
      }
    }
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        border: `1px solid ${palette.border.main}`
      }
    }
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        backgroundColor: '#ffffff'
      },
      '&.Mui-selected': {
        backgroundColor: palette.text.footer
      }
    }
  }
});
