import Icon from '@/modules/core/Icon';
import { plus, xIcon } from '@/assets/icons';
import { Box, Button, Checkbox, Collapse, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import style from './DrawerFilter.module.scss';
import classNames from 'classnames';
import { filter } from '@/assets/icons';

const DrawerFilter = ({
  isOpen = false,
  onClose = () => {},
  items = [],
  onSubmit = () => {},
  checkedFilters = {},
  setCheckedFilters = () => {},
  openFilterItems = {},
  setOpenFilterItems = () => {}
}) => {
  const [checked, setChecked] = useState(checkedFilters);
  const [openItems, setOpenItems] = useState(openFilterItems);

  const hasFilters = Object.values(checked).some(v => v);

  useEffect(() => {
    setChecked(checkedFilters);
  }, [checkedFilters]);

  useEffect(() => {
    setOpenItems(openFilterItems);
  }, [openFilterItems]);

  const handleToggle = (e, item) => {
    e.stopPropagation();
    const { id, value, parentId, onlyOneSelectable } = item;
    const idToAdd = `${parentId}-${id}-${value}`;
    if (onlyOneSelectable) {
      // only one item can be selected for these at a time, not both
      const others = items.find(i => i.id === parentId).options.filter(o => o.value !== value);
      setChecked((prev) => {
        const isChecked = prev[idToAdd];
        if (!isChecked) {
          const idsToRemove = others.map(o => `${parentId}-${o.id}-${o.value}`);
          const correctedChecked = { ...prev, [idToAdd]: !isChecked };
          idsToRemove.forEach((id) => {
            if (correctedChecked[id] !== undefined) {
              correctedChecked[id] = false;
            }
          });
          return correctedChecked;
        }
        return { ...prev, [idToAdd]: !isChecked };
      });
      return;
    }
    setChecked(prev => ({ ...prev, [idToAdd]: !prev[idToAdd] }));
  };

  const handleSubmit = () => {
    if (!checked || Object.keys(checked).length === 0) return;

    for (let key in checked) {
      if (checked[key] === false) {
        delete checked[key];
      }
    }

    setCheckedFilters(checked);
    setOpenFilterItems(openItems);

    const newFilter = {};

    Object.entries(checked).forEach(([key, selected]) => {
      const [parentId, id, value] = key.split('-');
      const item = items.find(i => i.id === parentId);
      if (!item.onlyOneSelectable) {
        if (!newFilter[id]) {
          newFilter[id] = [];
        }
        if (selected) {
          if (!newFilter[id].includes(value)) {
            newFilter[id].push(value);
          }
        } else {
          const index = newFilter[id].indexOf(value);
          if (index > -1) {
            newFilter[id].splice(index, 1);
          }
          if (newFilter[id].length === 0) {
            delete newFilter[id];
          }
        }
      } else {
        if (selected) {
          newFilter[id] = value;
        } else {
          delete newFilter[id];
        }
      }
    });
    onSubmit(newFilter);
  };

  const handleOpenItems = (e, item) => {
    e.stopPropagation();
    if (item.children && item.children.length > 0) {
      setOpenItems(prev => ({ ...prev, [`${item.id}-${item.value}`]: !prev[`${item.id}-${item.value}`] }));
    } else {
      setOpenItems(prev => ({ ...prev, [`${item.id}`]: !prev[`${item.id}`] }));
    }
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (item.children && item.children.length > 0) {
      handleOpenItems(e, item);
    } else {
      handleToggle(e, item);
    }
  };

  const handleClearFilters = () => {
    setChecked({});
  };

  const renderMenuItem = (item) => {
    const { id, label, value, parentId } = item;
    const labelId = `checkbox-list-label-${value}`;
    const isChecked = checked[`${parentId}-${id}-${value}`] || false;
    const isOpen = openItems[`${id}-${value}`] || false;

    return (
      <ListItem
        key={value}
        secondaryAction={<Checkbox tabIndex={item.children && item.children.length > 0 ? 0 : -1} edge='end' onChange={e => handleToggle(e, item)} checked={isChecked} inputProps={{ 'aria-labelledby': labelId }} className={style.checkbox} />}
        disablePadding
        className={style.listItem}
      >
        <ListItemButton className={style.listButton} onClick={e => handleItemClick(e, item)}>
          {item.children && item.children.length > 0
            ? (
              <IconButton
                size='small'
                aria-label={isOpen ? `Collapse ${item.value}` : `Expand ${item.value}`}
                aria-expanded={isOpen ? 'true' : 'false'}
                onClick={e => handleOpenItems(e, item)}
                className={style.expandButton}
                tabIndex={-1}
              >
                {isOpen ? <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={xIcon} /> : <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={plus} />}
              </IconButton>
              )
            : null}
          <ListItemText id={labelId} primary={<Typography>{label}</Typography>} sx={{ pr: 5 }} />
        </ListItemButton>
      </ListItem>
    );
  };

  const renderMenu = (items) => {
    return items.map((item, index) => {
      const isOpen = openItems[`${item.id}-${item.value}`] || false;
      return (
        <Fragment key={index}>
          {renderMenuItem(item)}
          {item.children && item.children.length > 0 && (
            <Collapse in={isOpen} timeout='auto' unmountOnExit>
              <List disablePadding dense sx={{ ml: 1.5 }} className={style.list}>
                {renderMenu(item.children.map(option => ({ ...option, itemId: item.id, parentId: item.parentId, onlyOneSelectable: item.onlyOneSelectable })))}
              </List>
            </Collapse>
          )}
        </Fragment>
      );
    });
  };

  return (
    <Drawer anchor='right' open={isOpen} onClose={onClose} className={style.root}>
      <Box className={style.filterWrapper}>
        <Box className={style.filters}>
          <Box className={style.header}>
            <Box className={style.left}>
              <Icon className={classNames('clym-contrast-exclude', style.headerIcon)} icon={filter} showShadow={true} shadowSize={4} />
              <Typography>Filter by</Typography>
            </Box>

          </Box>
          <List className={style.list} dense>
            {items.map((item) => {
              const isOpen = openItems[`${item.id}`] || false;
              return (
                <Fragment key={item.id}>
                  <ListItem
                    disablePadding
                    className={style.listItem}
                  >
                    <ListItemButton className={style.listButton} onClick={e => handleOpenItems(e, item)}>
                      <IconButton
                        size='small'
                        aria-label={isOpen ? `Collapse ${item.id}` : `Expand ${item.id}`}
                        aria-expanded={isOpen ? 'true' : 'false'}
                        onClick={e => handleOpenItems(e, item)}
                        className={style.expandButton}
                        tabIndex={-1}
                      >
                        {isOpen ? <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={xIcon} /> : <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={plus} />}
                      </IconButton>
                      <ListItemText primary={<Typography variant='h3'>{item.heading}</Typography>} sx={{ pr: 5 }} />
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={isOpen} timeout='auto' unmountOnExit>
                    <List disablePadding dense sx={{ ml: 1.5 }} className={style.list}>
                      {renderMenu(item.options.map(option => ({ ...option, parentId: item.id, onlyOneSelectable: item.onlyOneSelectable })))}
                    </List>
                  </Collapse>
                </Fragment>
              );
            })}
          </List>
        </Box>
        <Box className={style.footer}>
          <Button onClick={handleSubmit}>
            <Typography>Apply filters</Typography>
          </Button>
          <Button className={style.clear} variant='outlined' disabled={!hasFilters} onClick={handleClearFilters}>
            <Typography>Clear filters</Typography>
          </Button>
        </Box>
      </Box>
      <IconButton size='lg' color='primary' onClick={onClose} className={style.closeBtn}>
        <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={xIcon} />
      </IconButton>
    </Drawer>
  );
};
export default DrawerFilter;
