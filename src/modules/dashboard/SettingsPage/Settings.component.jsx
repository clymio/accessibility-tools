import Accessibility from '@/modules/dashboard/SettingsPage/Accessibility/Accessibility.component';
import Environments from '@/modules/dashboard/SettingsPage/Environments/Environments.component';
import Profiles from '@/modules/dashboard/SettingsPage/Profiles/Profiles.component';
import RemediationCategories from '@/modules/dashboard/SettingsPage/RemediationCategories/RemediationCategories.component';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './Settings.module.scss';
import { universalAccess, grid, pause, user } from '@/assets/icons';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role='tabpanel' tabIndex={-1} hidden={value !== index} id={`vertical-tabpanel-${index}`} aria-labelledby={`vertical-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  };
}

const TABS = [
  {
    label: 'Profile',
    component: Profiles,
    icon: user
  },
  {
    label: 'Accessibility',
    component: Accessibility,
    icon: universalAccess
  },
  {
    label: 'Environments',
    component: Environments,
    icon: grid
  },
  {
    label: 'Remediation categories',
    component: RemediationCategories,
    icon: pause
  }
];

export default function SettingsPage() {
  const router = useRouter();

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!router.isReady || !router.query) return;
    const { tab } = router.query;
    if (isNaN(tab)) return;
    setTabValue(Number(router.query.tab));
  }, [router.query, router.isReady]);

  return (
    <>
      <Box className={styles.root}>
        <Box className={styles.pageHeader}>
          <Box className={styles.titleWrapper}>
            <Typography variant='h2' className={styles.title}>
              Settings
            </Typography>
          </Box>
        </Box>
        <Box className={styles.contentContainer}>
          <Box className={styles.tabsWrapper}>
            <Tabs
              className={styles.tabs}
              orientation='vertical'
              variant='scrollable'
              value={tabValue}
              onChange={handleChange}
              aria-label='Settings options'
              sx={{ borderBottom: 0 }}
            >
              {TABS.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    className={styles.tab}
                    tabIndex={0}
                    key={i}
                    href={`#vertical-tabpanel-${i}`}
                    label={(
                      <>
                        <Icon style={{ marginRight: 8 }} />
                        <Typography variant='body2' className={styles.tabTitle}>
                          {tab.label}
                        </Typography>
                      </>
                    )}
                    {...a11yProps(i)}
                  />
                );
              })}
            </Tabs>
          </Box>
          <Box className={classNames(styles.scrollContentWrapper, { [styles.profileContentWrapper]: tabValue === 0 })}>
            {TABS.map((tab, i) => {
              const Component = tab.component;
              return (
                <TabPanel className={styles.tabPanel} value={tabValue} index={i} key={i}>
                  <Component />
                </TabPanel>
              );
            })}
          </Box>
        </Box>
      </Box>
    </>
  );
}
