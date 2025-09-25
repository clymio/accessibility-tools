'use strict';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { useState } from 'react';
import SearchBox from '../SearchBox';
import styles from './AccordionFilter.module.scss';
import { chevronDown, chevronUp } from '@/assets/icons';

export default function AccordionFilter({
  searchPlaceholder,
  loading,
  margin = true,
  labelHide = 'Hide filters',
  labelShow = 'Show filters',
  labelFilter = 'Filter results',
  labelReset = 'Reset',
  expanded = true,
  search = true,
  hasFilters = true,
  filter,
  onFilter,
  submitFilter,
  submitReset,
  onReset,
  children
}) {
  const [_expanded, setExpanded] = useState(expanded);
  const [resetSearch, setResetSearch] = useState(null);
  const handleFilter = () => {
    setExpanded(false);
    onFilter({ ...filter });
    if (submitFilter) {
      submitFilter();
    }
  };
  const handleReset = () => {
    setExpanded(false);
    setResetSearch(resetSearch === null ? 1 : resetSearch + 1);
    onReset({});
    if (submitReset) {
      submitReset();
    }
  };
  const handleSearch = (search) => {
    const nf = {
      ...filter,
      page: 1
    };
    if (search) {
      nf.search = search;
    } else {
      delete nf.search;
    }
    onFilter(nf);
  };
  const ToggleIcon = _expanded ? chevronDown : chevronUp;
  return (
    <section
      className={classNames(styles.root, {
        [styles.loading]: loading,
        [styles.margin]: margin
      })}
    >
      <div className={styles.loadingBox} />
      <Grid container spacing={2}>
        <Grid item xs={8}>
          {search && <SearchBox resetSearch={resetSearch} placeholder={searchPlaceholder} onChange={handleSearch} onSearch={() => onFilter({ ...filter })} />}
        </Grid>
        {hasFilters && (
          <Grid item xs={4} className={styles.toggles}>
            <Typography color='primary' component='a' variant='body2' onClick={() => setExpanded(!_expanded)}>
              {_expanded ? labelHide : labelShow}
              <ToggleIcon />
            </Typography>
          </Grid>
        )}
      </Grid>
      {_expanded && hasFilters && (
        <>
          <div className={styles.filters}>{children}</div>
          <div className={styles.actions}>
            <Button variant='text' onClick={handleReset}>
              <Typography>{labelReset}</Typography>
            </Button>
            <Button onClick={handleFilter}>{labelFilter}</Button>
          </div>
        </>
      )}
    </section>
  );
}
