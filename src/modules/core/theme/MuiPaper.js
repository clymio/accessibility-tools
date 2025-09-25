'use strict';
export default palette => ({
  MuiPaper: {
    defaultProps: {},
    styleOverrides: {
      root: {
        boxShadow: 'none'
      },
      rounded: {
        borderRadius: palette.shape.borderRadius
      }
    }
  }
});
