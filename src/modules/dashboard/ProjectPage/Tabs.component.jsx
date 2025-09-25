import IconButton from '@/modules/core/IconButton/IconButton.component';
import { useProjectStore } from '@/stores/useProjectStore';
import useWebviewStore from '@/stores/useWebviewStore';
import { Box, CircularProgress, Typography } from '@mui/material';
import classNames from 'classnames';
import { useState } from 'react';
import style from './Tabs.module.scss';
import { devices } from '@/assets/icons';

const Tab = ({ tab, selectedTab, setSelectedTab, isPageLoading, index, className }) => {
  return (
    <Box className={classNames(style.tab, { [style.active]: index === selectedTab }, className)} onClick={() => setSelectedTab(index)}>
      {index === selectedTab && isPageLoading && <CircularProgress size={16} />}
      <Typography>{tab.label}</Typography>
    </Box>
  );
};

const Tabs = () => {
  const { isPageLoading, selectedPage } = useProjectStore();
  const { isDomReady, openDevTools } = useWebviewStore();

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Box className={style.root}>
      <Box className={style.tabs}>
        <Tab
          tab={{ label: selectedPage.name }}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          isPageLoading={isPageLoading}
          className={style.selectedPageTab}
          index={0}
        />
      </Box>
      {isDomReady && <IconButton Icon={devices} tooltip='Open Devtools' className={style.openDevToolsBtn} onClick={openDevTools} />}
    </Box>
  );
};
export default Tabs;
