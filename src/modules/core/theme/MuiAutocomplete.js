'use strict';
export default palette => ({
  MuiAutocomplete: {
    defaultProps: {
      fullWidth: true
    },
    styleOverrides: {
      root: {},
      popper: {
        '.MuiPaper-root': {
          backgroundColor: palette.input.background,
          borderRadius: palette.shape.borderRadius,
          border: `1px solid ${palette.border.main}`,
          marginTop: 2,
          marginBottom: 2,
          '.MuiAutocomplete-listbox': {
            paddingTop: 2,
            paddingBottom: 2
          }
        }
      },
      noOptions: {
        margin: `2px 0`,
        fontSize: `15px`,
        opacity: 0.6,
        padding: `10px 8px`,
        lineHeight: `16px`,
        textAlign: 'center'
      }
    }
  }
});
