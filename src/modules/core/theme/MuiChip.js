'use strict';

export default palette => ({
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: palette.radius,
        backgroundColor: palette.chip.main,
        color: palette.primary.contrastText,
        fontFamily: 'var(--font-roboto),Arial,sans-serif',
        textTransform: 'uppercase',
        padding: 0,
        '& .MuiChip-label': {
          paddingLeft: 6,
          paddingRight: 6
        },
        '&.Mui-disabled': {
          backgroundColor: palette.input.disabledText,
          opacity: 0.3
        },
        '&.MuiChip-clickable:hover': {
          backgroundColor: palette.chip.hover
        }
      },
      filter: {
        backgroundColor: palette.chip.filter
      }
    }
  }
});
