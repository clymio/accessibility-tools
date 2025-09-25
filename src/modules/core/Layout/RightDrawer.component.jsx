import TestDetails from '@/modules/dashboard/ProjectPage/TestDetails';
import { useUiStore } from '@/stores';
import { Box } from '@mui/material';
import classNames from 'classnames';
import style from './RightDrawer.module.scss';

export const DRAWER_CONTENT_TYPE = {
  TEST_CASE_INFO: 'TEST_CASE_INFO'
};

const RightDrawer = () => {
  const { rightDrawerSettings } = useUiStore();

  let content = null;
  if (rightDrawerSettings.contentType === DRAWER_CONTENT_TYPE.TEST_CASE_INFO) {
    content = <TestDetails />;
  }

  return (
    <Box className={classNames(style.root, { [style.open]: rightDrawerSettings.isOpen, [style.testDrawer]: rightDrawerSettings.contentType === DRAWER_CONTENT_TYPE.TEST_CASE_INFO })}>
      {content}
    </Box>
  );
};
export default RightDrawer;
