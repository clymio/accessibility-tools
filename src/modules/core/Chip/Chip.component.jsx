import { default as MuiChip } from '@mui/material/Chip';
import classNames from 'classnames';
import style from './Chip.module.scss';

const Chip = ({ label, variant = 'outlined', size = 'small', type = '', className = '' }) => {
  return (
    <MuiChip label={label} variant={variant} size={size} className={classNames(style.root, style[type], className)} />
  );
};
export default Chip;
