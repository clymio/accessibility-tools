'use strict';
module.exports = palette => ({
  MuiTable: {
    styleOverrides: {
      root: {
        borderSpacing: '0 15px',
        borderCollapse: 'initial',
        // overflow: 'hidden',
        margin: '0px',
        padding: '0px'
      }
    }
  },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        background: 'transparent'
      }
    }
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        borderWidth: 0,
        backgroundColor: palette.input.background,
        borderColor: palette.background.default,
        borderRadius: palette.shape.borderRadius,
        // boxShadow: 'inset 4px 4px 6px 0px rgb(221,221,222), inset -1px -1px 2px 0px rgba(221,221,222,0.8)'
        '&:hover': {
          boxShadow: '1px 1px 6px rgba(210,210,210,0.4)'
        }
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: 0,
        borderTop: 0,
        '&:last-child': {
          borderRight: '1px solid rgba(0,0,0,0)',
          borderTopRightRadius: palette.shape.borderRadius,
          borderBottomRightRadius: palette.shape.borderRadius
        },
        '&:first-of-type': {
          borderLeft: '1px solid rgba(0,0,0,0)',
          borderTopLeftRadius: palette.shape.borderRadius,
          borderBottomLeftRadius: palette.shape.borderRadius
        }
      }
    }
  }
});
