import { activity, clipboard, xIcon } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import TestCaseInfo from '@/modules/dashboard/TestCasesPage/TestCaseInfo.component';
import { Box, Drawer, IconButton, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import style from './DrawerTestCase.module.scss';

const DrawerTestCase = ({ testCase, isOpen = false, onClose = () => {}, showCloseButton = true }) => {
  return (
    <Drawer open={isOpen} onClose={onClose} anchor='right'>
      {!testCase
        ? (
          <Skeleton width='100%' height='100%' />
          )
        : (
          <Box className={style.root}>
            <Box className={style.header}>
              <Box className={style.info}>
                <Typography variant='h2' className={style.id}>
                  <span><Icon className={classNames('clym-contrast-exclude', style.icon)} icon={testCase.type === 'MANUAL' ? clipboard : activity} /></span>
                  {testCase.id}
                </Typography>
              </Box>
              <Box className={style.name}>
                <Typography>{testCase.name}</Typography>
              </Box>
            </Box>
            <Box className={style.content}>
              <TestCaseInfo testCase={testCase} />
            </Box>
            {showCloseButton && (
              <IconButton className={style.closeButton} onClick={onClose}>
                <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={xIcon} />
              </IconButton>
            )}
          </Box>
          )}
    </Drawer>
  );
};
export default DrawerTestCase;
