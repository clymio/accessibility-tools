'use strict';
import style from './SearchBox.module.scss';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import {
  useState,
  useRef,
  useEffect
} from 'react';
import classNames from 'classnames';
import { magnifyingGlassPlusRegular, xIcon } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

export default function SearchBox({
  defaultValue,
  resetSearch,
  placeholder = 'Search',
  delay = 200,
  onChange,
  onSearch
}) {
  const searchRef = useRef(null);
  const [focusInput, setFocusInput] = useState(false);
  const [search, setSearch] = useState(null);
  useEffect(() => {
    if (typeof resetSearch !== 'number') return;
    handleClear();
  }, [resetSearch]);
  const handleClear = () => {
    if (searchRef.current) {
      searchRef.current.value = '';
    }
    setSearch('');
  };
  useEffect(() => {
    if (search === null) return;
    let t = setTimeout(() => {
      onChange(search);
    }, delay);
    return () => clearTimeout(t);
  }, [search]);
  return (
    <Paper className={classNames(style.inputWrapper, focusInput ? style.focused : '')}>
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          padding: 0
        }}
        placeholder={placeholder}
        inputProps={{
          'aria-label': 'search',
          ref: searchRef

        }}
        endAdornment={search
          ? (
            <IconButton
              className={style.clear}
              type='button'
              onClick={handleClear}
              aria-label='clear'
            >
              <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={xIcon} />
            </IconButton>
            )
          : undefined}
        defaultValue={defaultValue}
        onChange={c => setSearch((c.target.value || '').trim())}
        onFocus={() => setFocusInput(true)}
        onBlur={() => setFocusInput(false)}
      />
      <IconButton
        type='button'
        sx={{ p: '5px' }}
        onClick={onSearch}
        aria-label='search'
      >
        <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={magnifyingGlassPlusRegular} />
      </IconButton>
    </Paper>
  );
}
