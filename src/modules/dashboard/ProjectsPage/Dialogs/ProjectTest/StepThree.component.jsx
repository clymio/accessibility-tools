import { info } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import styles from './ProjectTest.module.scss';
import SitemapForm from './SitemapForm';

const StepThree = ({ saveBtnRef }) => {
  const { randomPages, addRandomPage, removeRandomPage, handleChange } = useProjectTestFormStore();

  const onSiteMapUpdate = async (newPageValue, index) => {
    const updatedRandomPages = [...randomPages];
    updatedRandomPages[index] = newPageValue || { id: '', label: '' };
    handleChange('randomPages', updatedRandomPages);
  };

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
      <SitemapForm pagesType='random' onSiteMapUpdate={onSiteMapUpdate} addPage={addRandomPage} removePage={removeRandomPage} saveBtnRef={saveBtnRef} />
    </div>
  );
};

export default StepThree;
