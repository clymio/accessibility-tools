import { xIcon } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import RemediationInfo from '@/modules/dashboard/RemediationsPage/RemediationInfo.component';
import { Box, Drawer, IconButton, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import style from './DrawerRemediation.module.scss';

const DrawerRemediation = ({ remediation, isOpen = false, onClose = () => {}, showCloseButton = true }) => {
  return (
    <Drawer open={isOpen} onClose={onClose} anchor='right'>
      {!remediation
        ? (
          <Skeleton width='100%' height='100%' />
          )
        : (
          <Box className={style.root}>
            <Box className={style.header}>
              <Box className={style.info}>
                <Typography variant='h2' className={style.id}>
                  {remediation.id}
                </Typography>
              </Box>
              <Box className={style.name}>
                <Typography>{remediation.name}</Typography>
              </Box>
            </Box>
            <Box className={style.content}>
              <RemediationInfo remediation={remediation} isDrawer />
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
export default DrawerRemediation;
