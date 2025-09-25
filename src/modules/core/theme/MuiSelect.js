'use strict';

export default palette => ({
  MuiSelect: {
    defaultProps: {},
    styleOverrides: {
      root: {
        borderRadius: palette.radius,
        marginTop: 0,
        'MuiSelect-outlined': {
          zIndex: 1,
          borderWidth: '1 !important'
        },
        input: {
          top: 0,
          left: 0,
          opacity: 0.6,
          height: '100%',
          color: `rgba(0, 0, 0, 0)`,
          backgroundColor: `rgba(0, 0, 0, 0)`,
          border: 0,
          zIndex: 0,
          paddingLeft: 16,
          '&::placeholder': {
            fontSize: 14,
            color: palette.secondary.muted
          }
        }
      },
      select: {
        paddingTop: 8,
        paddingBottom: 8,
        '&.MuiSelect-filled': {
          paddingTop: 0
        }
      },
      '& .MuiSelect-multiple': {
        '&.MuiInputBase-input': {
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '12px'
        },
        padding: 0,
        height: '39px !important',
        '& .MuiChip-label': {
          padding: '4px'
        },
        '& .MuiChip-root': {
          height: '20px',
          fontSize: '12px'
        }
      }
    }
  }
});
