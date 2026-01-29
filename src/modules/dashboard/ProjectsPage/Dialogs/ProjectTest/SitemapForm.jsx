import { plus, trash2 } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import Sitemap from '@/modules/core/Sitemap';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { Button, IconButton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import styles from './ProjectTest.module.scss';

const getFilteredSitemap = (sitemap, structuredPages = [], randomPages = []) => {
  if (!sitemap || sitemap.length === 0) return [];
  const filterChildren = (sitemapArray) => {
    return sitemapArray
      .map((item) => {
        const isItemInStructuredPages = structuredPages.some(page => page?.id && item?.id && page.id === item.id);
        const isItemInRandomPages = randomPages?.some(page => page?.id && item?.id && page.id === item.id);
        const isItemIncluded = isItemInRandomPages || isItemInStructuredPages;
        item.isSelected = isItemIncluded;
        const filteredChildren = item.children ? filterChildren(item.children) : [];
        const hasChildren = filteredChildren.length > 0;
        item.hasChildren = hasChildren;
        if (isItemIncluded && hasChildren) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
        return item;
      })
      .filter((item) => {
        if (!item) return false;
        if (item.isSelected && item.hasChildren) return true;
        return !item.isSelected && (item.hasChildren || !item.children);
      })
      .map(item => ({
        ...item,
        children: item.children ? filterChildren(item.children) : []
      }));
  };
  return filterChildren(sitemap || []);
};

const SitemapForm = ({ pagesType = '', onSiteMapUpdate, addPage, removePage, saveBtnRef }) => {
  const { environmentType, structuredPages, randomPages, errors } = useProjectTestFormStore();

  const addPageBtnRef = useRef(null);

  const pages = pagesType === 'structured' ? structuredPages : pagesType === 'random' ? randomPages : [];
  const pagesField = pagesType === 'structured' ? 'structuredPages' : 'randomPages';

  const [sitemap, setSitemap] = useState([]);
  const [filteredSitemap, setFilteredSitemap] = useState([]);

  useEffect(() => {
    const getSitemap = async (envId) => {
      const envSitemap = await window.api.environment.getSitemap({ environment_id: envId });
      setSitemap(envSitemap);
    };
    if (environmentType) {
      getSitemap(environmentType);
    }
  }, [environmentType]);

  useEffect(() => {
    setFilteredSitemap(getFilteredSitemap(sitemap, structuredPages, randomPages));
  }, [sitemap, structuredPages, randomPages]);

  if (pages.length === 0) return;

  return (
    <>
      {pages.map((page, index) => {
        const shouldAutoFocus
          = (!page?.id) && (index === 0 || index === structuredPages.length - 1);
        return (
          <div key={index} className={styles.pageRow}>
            <div className={styles.selectContainer}>
              <Typography variant='body1'>{index + 1}</Typography>
              <Sitemap
                type='autocomplete'
                sitemap={filteredSitemap}
                value={page}
                environmentType={environmentType}
                onValueUpdate={newValue => onSiteMapUpdate(newValue, index)}
                placeholder='Select page'
                error={errors?.[pagesField]?.[index]}
                leftIcon={false}
                rightIcon
                autoFocus={shouldAutoFocus}
                onAutocompleteBlurNext={() => {
                  if (!addPageBtnRef.current?.disabled) {
                    addPageBtnRef.current.focus();
                  } else if (saveBtnRef?.current) {
                    saveBtnRef.current.focus();
                  }
                }}
                saveBtnRef={saveBtnRef}
              />
              {pages.length > 1 && index !== 0 && (
                <IconButton
                  onClick={() => {
                    removePage(index);
                    setTimeout(() => {
                      addPageBtnRef.current?.focus();
                    }, 0);
                  }}
                  aria-label={`Remove page ${index + 1}`}
                  className={styles.deleteButton}
                >
                  <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={trash2} />
                </IconButton>
              )}
            </div>
          </div>
        );
      })}
      <Button ref={addPageBtnRef} variant='text' className={styles.addPageButton} onClick={addPage}>
        <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
        <Typography variant='body2'>Add another page</Typography>
      </Button>
    </>
  );
};
export default SitemapForm;
