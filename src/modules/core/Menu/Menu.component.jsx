import { Divider, MenuItem, Menu as MuiMenu, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import style from './Menu.module.scss';

const Menu = ({ onClose, anchorEl, items = [] }) => {
  if (!items || items.length === 0) return null;

  const anchorRef = useRef(anchorEl);

  useEffect(() => {
    if (!anchorEl) return;
    anchorRef.current = anchorEl;
  }, [anchorEl]);

  return (
    <MuiMenu
      keepMounted
      open={Boolean(anchorEl)}
      onClick={e => e.stopPropagation()}
      onClose={onClose}
      anchorEl={anchorEl}
      classes={{ paper: style.root }}
      TransitionProps={{
        onExited: () => {
          if (anchorRef.current) {
            anchorRef.current.focus();
          }
        }
      }}
    >
      {items.map((item, i) => {
        const {
          onClick = () => {},
          label = '',
          icon = null,
          className = '',
          divider = false,
          isDestroyItem = false
        } = item;

        const handleClick = () => {
          onClick();
          onClose();
        };

        const Icon = icon;
        return [
          <MenuItem key={`item-${i}`} className={classNames(style.menuItem, { [style.destroy]: isDestroyItem }, className)} onClick={handleClick}>
            {Icon && <Icon />}
            <Typography>{label}</Typography>
          </MenuItem>,
          divider && items.length !== i + 1 && <Divider key={`divider-${i}`} />
        ];
      })}
    </MuiMenu>
  );
};
export default Menu;
