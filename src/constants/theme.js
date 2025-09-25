import { themeOverrides } from '@/modules/core/theme';

const light_palette = {
  primary: {
    main: '#002AE6',
    disabled: '#0B56C9',
    hover: '#0B56C9',
    contrastText: '#ffffff',
    text: '#09154a',
    border: '#E3E3E3',
    green: '#00f178'
  },
  secondary: {
    main: '#d0d5dd',
    disabled: '#22C85C',
    hover: '#22C85C',
    muted: '#B1B1B1',
    contrastText: '#ffffff',
    light: '#00F279'
  },
  'secondary-inactive': {
    main: '#E5E5E5',
    muted: '#E5E5E5',
    contrastText: '#ffffff'
  },
  border: {
    main: '#E8EBF1'
  },
  label: {
    main: '#1d1d1d',
    active: '#464646'
  },
  input: {
    main: '#09154A',
    label: '#09154A',
    background: '#ffffff',
    disabled: '#CCD2E0',
    disabledText: '#474971',
    shadow: '0px 0px 4px #00000029',
    switch: '#262AE6',
    switchDisabled: '#CCD2E0',
    switchDisabledTrack: '#CCD2E0',
    switchDisabledThumb: '#FFFFFF',
    switchNotChecked: '#474974',
    switchNotCheckedThumb: '#FFFFFF'
  },
  table: {
    head: '#F8F9FB'
  },
  error: {
    main: '#DC3545',
    hover: '#C82333',
    disabled: '#E97B86',
    contrastText: '#ffffff'
  },
  success: {
    main: '#0A852D',
    hover: '#006C14',
    disabled: '#57D27A',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#FEC107',
    hover: '#E0A801',
    disabled: '#FED75E',
    contrastText: '#ffffff'
  },
  contrastThreshold: 2,
  background: {
    paper: '#F0F0F0',
    default: '#E9EBF0',
    divider: '#CDD2DF',
    disabled: '#8A9CB9'
  },
  text: {
    main: '#09154A',
    secondary: '#474971',
    footer: '#8E9CB9',
    white: '#FFFFFF',
    primary: '#565656'
  },
  menu: {
    main: '#919CB6',
    active: '#3b3c3c'
  },
  accordion: {
    active: '#F8F9FB',
    divider: '#D4D4D4',
    spacing: '24px'
  },
  chip: {
    main: '#454545',
    filter: '#0C1647',
    hover: '#696969',
    disabled: '#CDD2DF'
  },
  shape: {
    borderRadius: 2
  },
  radius: '2px',
  tooltip: {
    background: '#09154A'
  },
  dialog: {
    background: '#F8F9FB',
    input: '#FFFFFF',
    overlay: 'rgba(12, 22, 71, 0.7)',
    divider: '#E9EBF0'
  },
  tab: {
    active: '#454545',
    main: '#667085'
  },
  charts: {
    success: '#0024c7',
    error: '#395BF4',
    warning: '#7F97FF',
    info: '#ABB8F5'
  },
  statusSelect: {
    fail: {
      background: '#FEE4E2',
      color: '#B42318'
    },
    pass: {
      background: '#ECFDF3',
      color: '#039855'
    },
    warning: {
      background: '#FFFAEB',
      color: '#B54708'
    },
    disabled: {
      background: '#E4E7EC',
      color: '#344054'
    }
  },
  status: {
    inProgress: '#DC6803',
    closed: '#039855',
    open: '#98A2B3'
  }
};
const dark_palette = {
  primary: {
    main: '#002AE6',
    disabled: '#0B56C9',
    hover: '#0B56C9',
    contrastText: '#ffffff',
    text: '#FFFFFF',
    border: '#E3E3E3',
    green: '#00f178'
  },
  secondary: {
    main: '#22C85C',
    disabled: '#22C85C',
    hover: '#22C85C',
    muted: '#B1B1B1',
    contrastText: '#ffffff',
    light: '#00F279'
  },
  'secondary-inactive': {
    main: '#E5E5E5',
    muted: '#E5E5E5',
    contrastText: '#ffffff'
  },
  border: {
    main: '#E8EBF1'
  },
  label: {
    main: '#1d1d1d',
    active: '#464646'
  },
  input: {
    main: '#CDD2E1',
    label: '#09154A',
    background: '#1E1E1E',
    disabled: '#CCD2E0',
    disabledText: '#474971',
    shadow: '0px 0px 4px #00000029',
    switch: '#262AE6',
    switchDisabled: '#CCD2E0',
    switchDisabledTrack: '#CCD2E0',
    switchDisabledThumb: '#FFFFFF',
    switchNotChecked: '#474974',
    switchNotCheckedThumb: '#FFFFFF'
  },
  table: {
    head: '#F8F9FB'
  },
  error: {
    main: '#DC3545',
    hover: '#C82333',
    disabled: '#E97B86',
    contrastText: '#ffffff'
  },
  success: {
    main: '#0A852D',
    hover: '#006C14',
    disabled: '#57D27A',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#FEC107',
    hover: '#E0A801',
    disabled: '#FED75E',
    contrastText: '#ffffff'
  },
  contrastThreshold: 3,
  background: {
    paper: '#181818',
    default: '#E9EBF0',
    divider: '#CDD2DF',
    disabled: '#8A9CB9'
  },
  text: {
    main: '#FFFFFF',
    secondary: '#474971',
    footer: '#8E9CB9',
    white: '#FFFFFF',
    primary: '#565656'
  },
  menu: {
    main: '#919CB6',
    active: '#3b3c3c'
  },
  accordion: {
    active: '#F8F9FB',
    divider: '#424750',
    spacing: '24px'
  },
  chip: {
    main: '#454545',
    filter: '#0C1647',
    hover: '#313131',
    disabled: '#CDD2DF'
  },
  shape: {
    borderRadius: 2
  },
  radius: '2px',
  tooltip: {
    background: '#09154A'
  },
  dialog: {
    background: '#F8F9FB',
    input: '#FFFFFF',
    overlay: 'rgba(12, 22, 71, 0.7)',
    divider: '#E9EBF0'
  },
  tab: {
    active: '#F9FAFB',
    main: '#D0D5DD'
  },
  charts: {
    success: '#0024c7',
    error: '#395BF4',
    warning: '#7F97FF',
    info: '#D1D9FF'
  },
  statusSelect: {
    fail: {
      background: '#FEE4E2',
      color: '#B42318'
    },
    pass: {
      background: '#ECFDF3',
      color: '#039855'
    },
    warning: {
      background: '#FFFAEB',
      color: '#B54708'
    },
    disabled: {
      background: '#E4E7EC',
      color: '#344054'
    }
  },
  status: {
    inProgress: '#DC6803',
    closed: '#039855',
    open: '#98A2B3'
  }
};
export const getDesignTokens = mode => ({
  palette: {
    mode,
    ...(mode === 'light' ? light_palette : dark_palette)
  },
  components: themeOverrides(mode === 'light' ? light_palette : dark_palette)
});
