'use strict';

export default palette => ({
  MuiAccordion: {
    styleOverrides: {
      root: {
        BorderRadius: 0,
        '&:before': {
          display: 'none'
        },
        '&.Mui-expanded': {
          margin: 0
        }
      }
    }
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${palette.accordion.divider}`,
        margin: 0,
        padding: 0,
        '&.Mui-expanded': {
          minHeight: 'auto'
        }
      },
      content: {
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '&.Mui-expanded': {
          margin: '12px 0'
        }
      }
    }
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${palette.accordion.divider}`,
        padding: '12px 8px'
      }
    }
  }
});
