'use strict';
import { Button, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import classNames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import styles from './TablePagination.module.scss';

const LIMITS = [10, 25, 50, 75];
export default function Pagination({
  meta = null,
  filter = {},
  limits,
  defaultLimit = null,
  rowsPerPage = true,
  onChange = null,
  showFilterInfo,
  hasFilters,
  onFilterReset = () => {},
  filterLabel = 'items',
  actions,
  className = '',
  disabled = false,
  firstRowRef = null,
  tableRef = null
}) {
  if (!filter) filter = {};
  limits = limits || LIMITS;
  const [limit, setLimit] = useState(defaultLimit || filter.limit || limits[0]);
  useEffect(() => {
    if (!filter) return;
    if (typeof filter.limit === 'number' && filter.limit !== limit) setLimit(limit);
  }, [filter]);
  if (!meta || !onChange) return <Fragment />;
  const resetTable = () => {
    if (tableRef && tableRef.current) {
      tableRef.current.scrollTo({
        top: 0,
        left: 0
      });
    }
    if (firstRowRef && firstRowRef.current) {
      setTimeout(() => {
        firstRowRef.current.focus();
      }, 100);
    }
  };
  const handleArrow = async (p) => {
    if (filter.page > 1 && p < 0) {
      filter.page = meta.prev_page;
    }
    if (p > 0) {
      filter.page = meta.next_page;
    }
    changeFilter();
    resetTable();
  };
  const changeFilter = async () => {
    if (!filter.limit) filter.limit = limit;
    if (!filter.page) filter.page = 1;
    onChange({
      ...filter
    });
  };
  const handleLimit = (e) => {
    const l = e.target.value;
    setLimit(l);
    filter.limit = l;
    filter.page = 1;
    changeFilter();
  };
  const handleResetFilter = () => {
    onFilterReset();
    resetTable();
  };
  let currentPage
      = typeof meta.current_page === 'number'
        ? meta.current_page
        : typeof meta.next_page === 'number'
          ? meta.next_page - 1
          : typeof meta.prev_page === 'number'
            ? meta.prev_page + 1
            : 1,
    hasNext = typeof meta.next_page === 'number',
    hasPrevious = typeof meta.prev_page === 'number';
  if (currentPage === 1) {
    hasPrevious = false;
    if (!hasNext && filter?.limit <= 10) {
      rowsPerPage = false;
    }
  }
  return (
    <div
      className={classNames(styles.root, className, {
        [styles.withActions]: !!actions,
        [styles.disabled]: disabled
      })}
    >
      <div className={styles.filterInfoWrapper}>
        {showFilterInfo && (
          <>
            {hasFilters && (
              <Button className={styles.button} variant='outlined' disabled={!hasFilters} onClick={handleResetFilter}>
                <Typography>Reset filters</Typography>
              </Button>
            )}
            <Typography>
              Showing {meta.count < limit ? meta.count : limit} of {meta.count} {hasFilters ? 'filtered' : ''} {filterLabel}
            </Typography>
          </>
        )}
      </div>
      <div className={styles.limitWrapper}>
        {rowsPerPage && limits.length > 0 && (
          <div className={styles.limit}>
            <Typography>Rows per page</Typography>
            <FormControl variant='outlined' className={classNames('form-select', styles.select)}>
              <Select
                value={limit}
                color='primary'
                size='small'
                onChange={handleLimit}
                disabled={limits.length === 1}
                MenuProps={{
                  color: 'primary'
                }}
              >
                {limits.map(l => (
                  <MenuItem className={styles.selectItem} key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
        <div className={styles.paginationButtons}>
          <Button size='small' variant='outlined' aria-label='Go to previous page' onClick={() => handleArrow(-1)} disabled={!hasPrevious} className={styles.button}>
            <Typography>Previous</Typography>
          </Button>
          <Button size='small' variant='outlined' aria-label='Go to next page' onClick={() => handleArrow(1)} disabled={!hasNext} className={styles.button}>
            <Typography>Next</Typography>
          </Button>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
