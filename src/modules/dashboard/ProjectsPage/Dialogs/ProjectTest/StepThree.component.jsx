import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import styles from './ProjectTest.module.scss';
import Tooltip from '@mui/material/Tooltip';
import Sitemap from '@/modules/core/Sitemap';
import classNames from 'classnames';
import Icon from '@/modules/core/Icon';
import { info, trash2, plus } from '@/assets/icons';
import { Button, IconButton, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const StepThree = ({ saveBtnRef }) => {
  const getFilteredSitemap = () => {
    const filterChildren = (sitemapArray) => {
      return sitemapArray.filter((item) => {
        if (!item) return false;
        const isItemInRandomPages = randomPages.some(page => page?.id && item?.id && page.id === item.id);
        const isItemInStructuredPages = structuredPages.some(page => page?.id && item?.id && page.id === item.id);
        const filteredChildren = item.children ? filterChildren(item.children) : [];
        return !isItemInRandomPages && !isItemInStructuredPages && (filteredChildren.length > 0 || !item.children);
      }).map(item => ({
        ...item,
        children: item.children ? filterChildren(item.children) : []
      }));
    };

    return filterChildren(sitemap || []);
  };

  const addPageBtnRef = useRef(null);
  const { structuredPages, randomPages, errors, touched, addRandomPage, removeRandomPage, handleChange, environmentType } = useProjectTestFormStore();
  const [sitemap, setSitemap] = useState([]);
  const [filteredSitemap, setFilteredSitemap] = useState(getFilteredSitemap());

  const onSiteMapUpdate = async (newPageValue, index) => {
    const updatedRandomPages = [...randomPages];
    updatedRandomPages[index] = newPageValue || { id: '', label: '' };
    handleChange('randomPages', updatedRandomPages);
  };

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
    setFilteredSitemap(getFilteredSitemap());
  }, [randomPages, sitemap]);

  return (
    <div className={styles.stepThree}>
      <Typography variant='body1' className={styles.stepHeader}>
        Randomly selected sample
        <Tooltip title='Select web pages that reflect all identified (1) common web pages, (2) essential functionality, (3) types of web pages, (4) web technologies relied upon, and (5) other relevant web pages. For more information, see WCAG-EM Step 3.a: Include a Structured Sample. Note: ‘Web pages’ include different ‘web page states’; see definition of web page states.'>
          <span className={styles.infoIcon}>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
          </span>
        </Tooltip>
      </Typography>
      {randomPages.map((page, index) => (
        <div key={index} className={styles.pageRow}>
          <div className={styles.selectContainer}>
            <Typography>{index + 1}</Typography>
            <Sitemap
              type='autocomplete'
              sitemap={filteredSitemap}
              environmentType={environmentType}
              value={page}
              onValueUpdate={newValue => onSiteMapUpdate(newValue, index)}
              placeholder='Select page'
              error={errors?.randomPages?.[index]}
              leftIcon={false}
              rightIcon
              autoFocus={index === 0 || index === randomPages.length - 1}
              onAutocompleteBlurNext={() => {
                if (!addPageBtnRef.current?.disabled) {
                  addPageBtnRef.current.focus();
                } else if (saveBtnRef?.current) {
                  saveBtnRef.current.focus();
                }
              }}
              saveBtnRef={saveBtnRef}
            />
            {randomPages.length > 1 && index !== 0 && (
              <IconButton
                onClick={() => {
                  removeRandomPage(index);
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
      ))}
      <Button ref={addPageBtnRef} variant='text' className={styles.addPageButton} onClick={addRandomPage}>
        <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
        <Typography variant='body2'>Add another page</Typography>
      </Button>
    </div>
  );
};

export default StepThree;
