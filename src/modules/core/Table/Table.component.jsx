import { dragIndicator } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import {
  Box,
  Checkbox,
  LinearProgress,
  IconButton as MuiIconButton,
  Table as MuiTable,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import classNames from 'classnames';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import IconButton from '../IconButton';
import Menu from '../Menu';
import style from './Table.module.scss';

const ITEM_TYPE = 'ROW';

const DraggableTableRow = ({ index, id, moveRow, onDrop, firstRowRef = null, children, ...props }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) return;
      onDrop?.();
    }
  });

  drag(drop(ref));

  useEffect(() => {
    if (firstRowRef) {
      firstRowRef = ref;
    }
  }, [ref]);

  return (
    <TableRow
      ref={ref}
      {...props}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        ...props.sx
      }}
    >
      {children}
    </TableRow>
  );
};

const Table = forwardRef(
  (
    {
      headings = [],
      rows = [],
      onClick = () => {},
      size = 'medium',
      ariaLabel = '',
      className = '',
      maxHeight = null,
      selectable = false,
      selected = [],
      onSelectAllClick = () => {},
      totalCount = 0,
      sortable = false,
      onSort = () => {},
      actionItems = [],
      isLoading = false,
      skeletonRowsCount = 0,
      draggable = false,
      moveRow = () => {},
      onDrop = () => {},
      firstRowRef = null
    },
    ref
  ) => {
    const [order, setOrder] = sortable ? useState('asc') : ['asc', () => {}];
    const [orderBy, setOrderBy] = sortable ? useState('') : ['', () => {}];
    const [menuState, setMenuState] = useState({ anchorEl: null, row: null });

    const handleSort = (property) => {
      const isAsc = orderBy === property && order === 'asc';
      const direction = isAsc ? 'desc' : 'asc';
      setOrder(direction);
      setOrderBy(property);
      onSort(property, direction);
    };

    const handleDropdownClose = () => {
      setMenuState({ anchorEl: null, row: null });
    };

    const handleKeyMoveDown = (e, index) => {
      if (e.key === 'ArrowUp' && index > 0) {
        moveRow(index, index - 1);
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' && index < rows.length - 1) {
        moveRow(index, index + 1);
        e.preventDefault();
      }
    };

    const handleKeyMoveUp = () => {
      onDrop();
    };

    return (
      <TableContainer
        component={Paper}
        className={classNames(style.root, className)}
        sx={{ '--max-height': maxHeight || 'calc(100vh - var(--top-margin))', opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}
        ref={ref}
      >
        {isLoading && <LinearProgress className={style.loader} />}
        {draggable && (
          <div id='dragHint' style={visuallyHidden}>
            Press arrow up or arrow down to move this row.
          </div>
        )}
        <MuiTable aria-label={ariaLabel} size={size} className={classNames(style.table, { [style.sortable]: sortable })} stickyHeader>
          <TableHead>
            <TableRow>
              {draggable && <TableCell padding='checkbox' />}
              {selectable && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < totalCount}
                    checked={rows.length > 0 && selected.length === totalCount}
                    onChange={onSelectAllClick}
                    disabled={rows.length === 0}
                    inputProps={{
                      'aria-label': `select all ${ariaLabel}`
                    }}
                  />
                </TableCell>
              )}
              {headings.map(heading => (
                <TableCell
                  key={heading.id}
                  sortDirection={sortable && !heading.not_sortable ? (orderBy === heading.id ? order : false) : undefined}
                  sx={{
                    width: heading.width,
                    minWidth: heading.minWidth || 'auto',
                    maxWidth: heading.maxWidth || 'auto'
                  }}
                  component='th'
                >
                  {sortable && !heading.not_sortable
                    ? (
                      <TableSortLabel active={orderBy === heading.id} direction={orderBy === heading.id ? order : 'asc'} onClick={() => handleSort(heading.id)}>
                        <Typography>{heading.label}</Typography>
                        {orderBy === heading.id
                          ? (
                            <Box component='span' sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                            )
                          : null}
                      </TableSortLabel>
                      )
                    : (
                      <Typography>{heading.label}</Typography>
                      )}
                </TableCell>
              ))}
              {actionItems.length > 0 && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && skeletonRowsCount > 0
              ? (
                  Array.from({ length: skeletonRowsCount }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={headings.length + (selectable ? 1 : 0) + (actionItems.length > 0 ? 1 : 0)} align='center' className={style.skeletonCell}>
                        <Box width='100%' height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                )
              : rows.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={headings.length + (selectable ? 1 : 0) + (actionItems.length > 0 ? 1 : 0)} align='center'>
                      <Typography>No rows found</Typography>
                    </TableCell>
                  </TableRow>
                  )
                : (
                    rows.map((row, i) => {
                      const isItemSelected = selectable ? selected.includes(row.id) : false;
                      const labelId = `${ariaLabel.replace(' ', '-')}-table-${selectable ? 'checkbox-' : ''}${i}`;
                      const enhancedActionItems = actionItems
                        .filter((item) => {
                          if (!item.isOptionRemoved) return true;
                          return item.isOptionRemoved(row);
                        })
                        .map(item => ({
                          ...item,
                          onClick: () => item.onClick?.(row)
                        }));

                      const RowComponent = draggable ? DraggableTableRow : TableRow;
                      return (
                        <RowComponent
                          key={row.id}
                          id={row.id}
                          index={i}
                          {...(draggable ? { moveRow, onDrop } : {})}
                          hover
                          onClick={() => onClick(row)}
                          role={selectable ? 'checkbox' : 'row'}
                          aria-checked={isItemSelected}
                          tabIndex={onClick ? 0 : -1}
                          selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                          onKeyDown={(e) => {
                            if (e.currentTarget === document.activeElement && e.key === 'Enter' && onClick) {
                              e.preventDefault();
                              onClick(row);
                            }
                          }}
                          onKeyUp={(e) => {
                            if (e.currentTarget === document.activeElement && e.key === ' ' && onClick) {
                              e.preventDefault();
                              onClick(row);
                            }
                          }}
                          {...(i === 0 && firstRowRef ? { ref: firstRowRef } : {})}
                        >
                          {draggable && (
                            <TableCell padding='checkbox' className={style.dragIcon}>
                              <MuiIconButton aria-label='move row' aria-describedby='dragHint' onKeyDown={e => handleKeyMoveDown(e, i)} onKeyUp={handleKeyMoveUp}>
                                <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={dragIndicator} />
                              </MuiIconButton>
                            </TableCell>
                          )}
                          {selectable && (
                            <TableCell padding='checkbox'>
                              <Checkbox color='primary' checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} tabIndex={onClick ? -1 : 0} />
                            </TableCell>
                          )}
                          {row.items.map((item, i) => {
                            const { component, props = {}, tooltip } = item;
                            const firstColProps = i === 0 ? { id: labelId, scope: 'row' } : {};
                            return (
                              <TableCell key={`${item.label}-${i}`} {...firstColProps} {...props}>
                                {tooltip
                                  ? (
                                    <Tooltip title={tooltip} placement='top'>
                                      {component || <Typography noWrap>{item.label}</Typography>}
                                    </Tooltip>
                                    )
                                  : (
                                      component || <Typography noWrap>{item.label}</Typography>
                                    )}
                              </TableCell>
                            );
                          })}
                          {actionItems.length > 0 && (
                            <TableCell>
                              <IconButton
                                disabled={row.disableActions}
                                Icon='moreVert'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuState({ anchorEl: e.currentTarget, row });
                                }}
                              />
                              {menuState.row?.id === row.id && <Menu anchorEl={menuState.anchorEl} onClose={handleDropdownClose} items={enhancedActionItems} />}
                            </TableCell>
                          )}
                        </RowComponent>
                      );
                    })
                  )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    );
  }
);

Table.displayName = 'Table';

export default Table;
