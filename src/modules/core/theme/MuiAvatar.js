'use strict';
module.exports = palette => ({
  MuiAvatar: {
    styleOverrides: {
      root: {
        width: 32,
        height: 32
      },
      img: {
        objectFit: 'contain'
      },
      rounded: {
        borderRadius: '50%',
        backgroundColor: palette.text.secondary
      }
    }
  }
});
