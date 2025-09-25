import { useUiStore } from '@/stores';
import { Autocomplete, Box, Button, Popover, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import style from './Search.module.scss';

const pages = Array(100)
  .fill(null)
  .map((_, index) => ({ id: index + 1, label: `Page ${index + 1}` }));

const Search = () => {
  const textFieldRef = useRef(null);
  const [isTextFieldFocused, setIsTextFieldFocused] = useState(false);
  const [anchorEl, setAnchorEl] = useState();
  const { theme } = useUiStore();

  const palette = theme.palette;

  const handlePopoverClick = (event) => {
    setIsTextFieldFocused(false);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const handleOnChange = (_, value) => {
    setAnchorEl(null);
    console.log(`${value.label} clicked`);
  };

  const isPopoverOpen = Boolean(anchorEl);
  return (
    <>
      <Button
        aria-describedby='search-btn'
        onClick={handlePopoverClick}
        variant='outlined'
        className={style.popoverBtn}
        sx={{
          opacity: isPopoverOpen ? '0' : '100%'
        }}
      >
        <Typography>Search</Typography>
      </Button>
      <Popover
        id='search-btn'
        open={isPopoverOpen}
        onClose={handlePopoverClose}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        TransitionProps={{
          onEntered: () => {
            textFieldRef.current.focus();
          }
        }}
        className={style.popover}
        sx={{
          overflow: 'hidden',
          top: -10,
          '& .MuiAutocomplete-paper': {
            marginBlock: '4px',
            border: 'none !important',
            color: palette.input.main,
            backgroundColor: `${palette.background.paper} !important`
          },
          '& .MuiPopover-paper': {
            overflowY: 'hidden !important',
            borderRadius: '8px'
          },
          '& .MuiAutocomplete-listbox': {
            maxHeight: 'calc(50vh - 42px)'
          },
          '& .MuiAutocomplete-popper': {
            transform: `translate3d(0px, 33px, 0px) ${isTextFieldFocused ? '' : '!important'}`,
            width: '100% !important'
          }
        }}
      >
        <Box className={style.popoverContainer}>
          <Autocomplete
            disablePortal
            options={pages}
            fullWidth
            open
            autoHighlight
            freeSolo
            handleHomeEndKeys
            selectOnFocus
            clearOnBlur
            onChange={handleOnChange}
            sx={{
              '& .MuiAutocomplete-inputRoot': {
                padding: '0 !important',
                borderRadius: 0
              }
            }}
            renderOption={(props, item) => (
              <li {...props} key={props.key} className={classNames(props.className, style.listItem)}>
                {item.label}
              </li>
            )}
            renderInput={params => (
              <Box paddingX='8px'>
                <TextField
                  {...params}
                  sx={{
                    margin: 0
                  }}
                  id='id'
                  variant='outlined'
                  placeholder='Search pages by name'
                  inputRef={textFieldRef}
                  onFocus={() => setIsTextFieldFocused(true)}
                />
              </Box>
            )}
          />
        </Box>
      </Popover>
    </>
  );
};
export default Search;
