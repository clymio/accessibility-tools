'use strict';
import { lighten } from '@mui/material/styles';

export default palette => ({
  MuiDivider: {
    styleOverrides: {
      root: {
        backgroundColor: palette.background.divider,
        borderColor: lighten(palette.background.divider, 0.4),
        height: 2,
        borderWidth: 1,
        borderTopWidth: 0
      },
      vertical: {
        height: '100%',
        width: 2,
        borderWidth: 1,
        borderRightWidth: 0,
        borderTopWidth: 0
      }
    }
  }
});
