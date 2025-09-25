import { useProjectStore } from '@/stores/useProjectStore';
import { Collapse, IconButton, List, ListItem, ListItemText } from '@mui/material';
import classNames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import style from './SitemapList.module.scss';
import { chevronDown, chevronUp } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

const SitemapList = ({ sitemap = [], onValueUpdate = () => {}, autoFocus = false }) => {
  const { selectedPage, setSelectedPage } = useProjectStore();
  const [openItems, setOpenItems] = useState({});
  const [activeItem, setActiveItem] = useState(selectedPage.id || 'HOME');

  const handleOpenItems = (e, item) => {
    e.stopPropagation();
    if (item.children) {
      setOpenItems(prev => ({ ...prev, [item.id]: !prev[item.id] }));
    }
  };
  const handleItemClick = (e, item) => {
    if (item.not_clickable) {
      return handleOpenItems(e, item);
    }
    setSelectedPage(item);
    onValueUpdate(item);
  };
  const renderMenuItem = (item) => {
    const isActive = item.id === activeItem;
    return (
      <ListItem
        tabIndex={0}
        disablePadding
        component='div'
        role='button'
        onClick={e => handleItemClick(e, item)}
        className={classNames(style.listItem, { [style.active]: isActive })}
      >
        <ListItemText primary={item.name} className={style.listItemText} />
        {item.children
          ? (
            <IconButton
              aria-label={openItems[item.id] ? `Collapse ${item.name}` : `Expand ${item.name}`}
              aria-expanded={openItems[item.id] ? 'true' : 'false'}
              onClick={e => handleOpenItems(e, item)}
            >
              {openItems[item.id] ? <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={chevronUp} /> : <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={chevronDown} />}{' '}
            </IconButton>
            )
          : null}
      </ListItem>
    );
  };
  const renderMenu = (items, level = 0) => {
    return items.map((item, index) => (
      <Fragment key={index}>
        {renderMenuItem(item)}
        {item.children && (
          <Collapse in={openItems[item.id]} timeout='auto' unmountOnExit>
            <List disablePadding sx={{ ml: level + 1 }} className={classNames(style.list, style.track)}>
              {renderMenu(item.children, level + 1)}
            </List>
          </Collapse>
        )}
      </Fragment>
    ));
  };

  useEffect(() => {
    if (selectedPage) {
      setActiveItem(selectedPage.id);
    }
  }, [selectedPage]);

  return (
    <List component='nav' disablePadding autoFocus={autoFocus}>
      {renderMenu(sitemap)}
    </List>
  );
};
export default SitemapList;
