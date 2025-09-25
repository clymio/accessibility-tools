'use strict';
import MuiButton from './MuiButton';
import MuiLabel from './MuiLabel';
import MuiInputLabel from './MuiInputLabel';
import MuiOutlinedInput from './MuiOutlinedInput';
import MuiFilledInput from './MuiFilledInput';
import MuiTextField from './MuiTextField';
import MuiSwitch from './MuiSwitch';
import MuiFormControl from './MuiFormControl';
import MuiSelect from './MuiSelect';
import MuiDivider from './MuiDivider';
import MuiAvatar from './MuiAvatar';
import MuiTypography from './MuiTypography';
import MuiPaper from './MuiPaper';
import MuiList from './MuiList';
import MuiDialog from './MuiDialog';
import MuiChip from './MuiChip';
import MuiTable from './MuiTable';
import MuiTab from './MuiTab';
import MuiAccordion from './MuiAccordion';
import MuiSnackbar from './MuiSnackbar';
import MuiAutocomplete from './MuiAutocomplete';

export function themeOverrides(palette) {
  return buildOverrides([
    MuiButton,
    MuiTypography,
    MuiLabel,
    MuiInputLabel,
    MuiOutlinedInput,
    MuiFilledInput,
    MuiTextField,
    MuiFormControl,
    MuiSelect,
    MuiSnackbar,
    MuiSwitch,
    MuiChip,
    MuiDivider,
    MuiAvatar,
    MuiPaper,
    MuiList,
    MuiTab,
    MuiAccordion,
    MuiDialog,
    MuiTable,
    MuiAutocomplete
  ], palette);
}

function buildOverrides(comps, palette) {
  let res = {};
  for (let i = 0, len = comps.length; i < len; i++) {
    res = {
      ...res,
      ...comps[i](palette)
    };
  }
  return res;
}
