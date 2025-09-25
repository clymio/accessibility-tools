'use strict';
export default palette => ({
  MuiSwitch: {
    defaultProps: {
      size: 'medium'
    },
    variants: [
      {
        props: { variant: 'text' },
        style: {
          width: 32,
          height: 16,
          marginLeft: 11,
          '& .MuiSwitch-switchBase': {
            backgroundColor: palette.input.disabled,
            padding: 0,
            top: '3px',
            left: '5px',

            '&.Mui-disabled': {
              backgroundColor: palette.input.switchDisabledThumb,
              color: palette.input.background
            },
            '&.Mui-disabled.Mui-checked': {
              backgroundColor: palette.input.switchDisabledThumb,
              color: palette.input.background,
              '.MuiSwitch-thumb': {
                backgroundColor: palette.input.switch
              }
            }
          },
          '& .MuiSwitch-thumb': {
            width: 10,
            height: 10,
            padding: 0,
            boxShadow: 'none',
            color: palette.input.background
          },
          '& .MuiSwitch-switchBase + .MuiSwitch-track': {
            backgroundColor: palette.input.switchNotChecked,
            opacity: 1
          },
          '& .MuiSwitch-switchBase.Mui-checked': {
            left: '-1px',
            color: palette.input.switch,
            width: '10px',
            height: '10px',
            backgroundColor: palette.input.background,
            '&:hover': {
              backgroundColor: palette.input.background
            }
          }
        }
      }
    ],
    styleOverrides: {
      root: {
        width: 44,
        height: 26,
        padding: 0,
        marginRight: 8,
        '&.MuiSwitch-sizeSmall': {
          transform: 'scale(0.75)'
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
          backgroundColor: palette.input.switch,
          opacity: 1
        },
        '& .MuiSwitch-switchBase.Mui-disabled.Mui-checked': {
          backgroundColor: palette.input.switchDisabledThumb,
          color: palette.input.background
        },
        '& .MuiSwitch-switchBase.Mui-disabled.Mui-checked + .MuiSwitch-track': {
          backgroundColor: palette.input.switchDisabledTrack,
          opacity: 1
        },
        '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: palette.input.switchDisabledTrack
        },
        '& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb': {
          backgroundColor: palette.input.switchDisabledThumb
        },
        '& .MuiSwitch-switchBase.Mui-disabled.Mui-checked .MuiSwitch-thumb': {
          backgroundColor: palette.input.switchDisabledThumbActive
        },
        '& .MuiSwitch-switchBase.Mui-disabled+.MuiSwitch-track': {
          backgroundColor: palette.input.switchDisabled
        },
        '& .MuiSwitch-switchBase': {
          padding: 0,
          top: '3px',
          left: '3px'
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
          left: '1px',
          '&::after': {
            content: '"\\ea01"',
            fontFamily: '"clym-icon-checkmark"',
            position: 'absolute',
            color: palette.input.switch,
            fontSize: '8px'
          }
        },
        '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
          backgroundColor: palette.input.background
        },
        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
          backgroundColor: palette.input.switchNotChecked
        },
        '.MuiSvgIcon-root': {
          width: 22,
          height: 22,
          marginTop: -2,
          color: palette.input.background
        },
        '& .MuiSwitch-thumb': {
          width: 20,
          height: 20,
          padding: 0,
          boxShadow: 'none',
          backgroundColor: palette.input.switchNotCheckedThumb,
          color: palette.input.background
        },
        '& .MuiSwitch-track': {
          borderRadius: 20,
          backgroundColor: palette.input.switch,
          opacity: 1
        },
        '& .MuiFormControlLabel-root': {
          marginRight: 0
        }
      }
    }
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        padding: 5,
        marginLeft: 10,
        marginRight: 4,
        marginBottom: 2
      }
    }
  }
});
