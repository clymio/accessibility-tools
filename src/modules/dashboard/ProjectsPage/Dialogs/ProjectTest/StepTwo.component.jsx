import Sitemap from '@/modules/core/Sitemap';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { info, plus, trash2 } from '@/assets/icons';
import { Button, IconButton, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useRef, useState } from 'react';
import styles from './ProjectTest.module.scss';
import classNames from 'classnames';
import Icon from '@/modules/core/Icon';

const StepTwo = ({ saveBtnRef }) => {
  const getFilteredSitemap = () => {
    const filterChildren = (sitemapArray) => {
      return sitemapArray.filter((item) => {
        if (!item) return false;
        const isItemInStructuredPages = structuredPages.some(page => page?.id && item?.id && page.id === item.id);
        const isItemInRandomPages = randomPages?.some(page => page?.id && item?.id && page.id === item.id);
        const filteredChildren = item.children ? filterChildren(item.children) : [];
        return !isItemInStructuredPages && !isItemInRandomPages && (filteredChildren.length > 0 || !item.children);
      }).map(item => ({
        ...item,
        children: item.children ? filterChildren(item.children) : []
      }));
    };

    return filterChildren(sitemap || []);
  };

  const addPageBtnRef = useRef(null);
  const { randomPages, structuredPages, errors, touched, addStructuredPage, removeStructuredPage, handleChange, environmentType } = useProjectTestFormStore();
  const [sitemap, setSitemap] = useState([]);
  const [filteredSitemap, setFilteredSitemap] = useState(getFilteredSitemap());

  const onSiteMapUpdate = async (newPageValue, index) => {
    const updatedStructuredPages = [...structuredPages];
    updatedStructuredPages[index] = newPageValue || { id: '', label: '' };
    handleChange('structuredPages', updatedStructuredPages);
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
  }, [structuredPages, sitemap]);

  return (
    <div className={styles.stepTwo}>
      <Typography variant='body1' className={styles.stepHeader}>
        Structured sample web pages
        <Tooltip title='Select web pages that reflect all identified (1) common web pages, (2) essential functionality, (3) types of web pages, (4) web technologies relied upon, and (5) other relevant web pages. For more information, see WCAG-EM Step 3.a: Include a Structured Sample. Note: ‘Web pages’ include different ‘web page states’; see definition of web page states.'>
          <span className={styles.infoIcon}>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
          </span>
        </Tooltip>
      </Typography>
      {structuredPages.map((page, index) => (
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
              error={errors?.structuredPages?.[index]}
              leftIcon={false}
              rightIcon
              autoFocus={index === 0 || index === structuredPages.length - 1}
              onAutocompleteBlurNext={() => {
                if (!addPageBtnRef.current?.disabled) {
                  addPageBtnRef.current.focus();
                } else if (saveBtnRef?.current) {
                  saveBtnRef.current.focus();
                }
              }}
              saveBtnRef={saveBtnRef}
            />
            {structuredPages.length > 1 && index !== 0 && (
              <IconButton
                onClick={() => {
                  removeStructuredPage(index);
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
      <Button disabled={!structuredPages[structuredPages.length - 1]?.id} ref={addPageBtnRef} variant='text' className={styles.addPageButton} onClick={addStructuredPage}>
        <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
        <Typography variant='body2'>Add another page</Typography>
      </Button>
    </div>
  );
};

export default StepTwo;
