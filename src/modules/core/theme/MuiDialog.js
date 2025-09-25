'use strict';
import { lighten } from '@mui/material/styles';

export default palette => ({
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: palette.dialog.background,
        overflow: 'visible',
        borderRadius: '2px',
        minWidth: 600,
        width: '100%',
        padding: '30px 50px'
      }
    }
  },
  MuiBackdrop: {
    styleOverrides: {
      root: {
        zIndex: 100,
        '&:not(.MuiBackdrop-invisible)': {
          background: palette.dialog.overlay
        }
      }
    }
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '0 20px 20px 0',
        fontSize: 24,
        fontWeight: 500,
        borderBottom: `1px solid ${palette.dialog.divider}`
      }
    }
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '20px 0 20px 0',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }
    }
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        marginTop: 20,
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }
  }
});
