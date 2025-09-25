import { Box, LinearProgress as MuiLinearProgress } from '@mui/material';
import classNames from 'classnames';
import styles from './LinearProgress.module.scss';

export default function LinearProgress({ current = 0, total = 1 }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <Box className={classNames('clym-contrast-exclude', styles.root)} display='flex' alignItems='center' gap={1}>
      <Box flex={1} position='relative'>
        <MuiLinearProgress
          className={styles.progressBar}
          variant='determinate'
          value={percent}
        />
      </Box>
    </Box>
  );
}
