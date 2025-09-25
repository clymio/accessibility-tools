'use strict';

export default palette => ({
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        paddingBottom: 8,
        paddingTop: 8,
        minHeight: 40,
        color: palette.tab.main,
        '&.Mui-selected': {
          color: palette.tab.active,
          borderTopLeftRadius: palette.shape.borderRadius,
          borderTopRightRadius: palette.shape.borderRadius
        }
      }
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 40
      },
      indicator: {
        backgroundColor: palette.tab.active
      }
    }
  }
});
