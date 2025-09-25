'use strict';
export default palette => ({
  MuiFilledInput: {
    defaultProps: {
      size: 'small'
    },
    styleOverrides: {

      root: {
        '&:before': {
          display: 'none'
        },
        '&:after': {
          display: 'none'
        }
      }
    }
  }
});
