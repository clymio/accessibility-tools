import { debounce, InputAdornment, TextField } from '@mui/material';
import classNames from 'classnames';
import { forwardRef, useMemo } from 'react';
import style from './Search.module.scss';
import { search } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

const Search = forwardRef(({ onSearch = () => {}, value = '', setValue = () => {}, debounceVars = [], className = '', tabIndex = 0 }, ref) => {
  const handleSearch = (e) => {
    const value = e.target.value;
    setValue(value);
    debouncedUpdateSearch(value);
  };

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        onSearch(value);
      }, 500),
    [debounceVars]
  );

  return (
    <TextField
      className={classNames(style.root, className)}
      placeholder='Search'
      variant='outlined'
      value={value}
      onChange={handleSearch}
      inputRef={ref}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <Icon className={classNames('clym-contrast-exclude', style.searchIcon)} icon={search} />
            </InputAdornment>
          )
        },
        htmlInput: {
          tabIndex
        }
      }}
    />
  );
});

Search.displayName = 'Search';

export default Search;
