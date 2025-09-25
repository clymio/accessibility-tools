'use strict';
import { Fragment, useEffect, useState } from 'react';
import TablePagination from './TablePagination.component';
import classNames from 'classnames';
import styles from './TablePagination.module.scss';

/**
 * Component that handles client-side pagination with a single large result set.
 * */
export default function ClientPagination({
  items = [], // a list of all the items available.
  onItem, // the callback function to call when rendering an item.
  onWrap, // if set, the callback function to use when wrapping the entire content.
  noItems, // the text to display when we don't have items.
  limits = [10, 20], // the rows per page to use.
  children,
  showPagination = true, // whether or not to show the pagination component.
  stretchHeight,
  currentPage, // optional external state for current page
  onPageChange = () => {},
  actions
}) {
  const [entities, setEntities] = useState(items || []);
  const [filter, setFilter] = useState({
    page: currentPage || 1,
    limit: limits[0]
  });
  useEffect(() => {
    setEntities([...items]);
    setFilter({
      ...filter,
      page: currentPage || 1
    });
  }, [items, currentPage]);

  const onChangePage = (filter) => {
    setFilter({ ...filter });
    onPageChange(filter.page);
  };
  onWrap
    = onWrap
    || function wrap(content) {
      return content;
    };
  const startPos = (filter.page - 1) * filter.limit,
    endPos = startPos + filter.limit,
    visibleEntities = [];
  for (let i = startPos; i < endPos; i++) {
    const m = entities[i];
    if (!m) break;
    visibleEntities.push(m);
  }
  const meta = {
    current_page: filter.page
  };
  if (meta.current_page > 1) meta.prev_page = meta.current_page - 1;
  if (entities.length > endPos) meta.next_page = meta.current_page + 1;

  return (
    <div className={classNames({ [styles.clientPaginationWrapper]: stretchHeight })}>
      <div>
        {onWrap(
          <>
            {children}

            {visibleEntities.length === 0 ? noItems : ''}
            {visibleEntities.map((m, i) => {
              const r = onItem(m, i);
              if (!r) return;
              return <Fragment key={`${i}.${filter.page}`}>{r}</Fragment>;
            })}
          </>
        )}
      </div>
      <div className={classNames({ [styles.paginationCount]: stretchHeight })}>
        {showPagination && (
          <TablePagination
            filter={filter}
            limits={limits}
            meta={meta}
            onChange={onChangePage}
            actions={actions}
          />
        )}
      </div>
    </div>
  );
}
