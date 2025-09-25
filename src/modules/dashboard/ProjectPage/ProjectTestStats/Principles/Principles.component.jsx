import { Box, LinearProgress, Typography } from '@mui/material';
import style from './Principles.module.scss';

const Principles = ({ stats }) => {
  if (!stats) return null;
  return (
    <Box className={style.root}>
      {Object.entries(stats).map(([name, { count, total }]) => (
        <Box key={name} className={style.stat}>
          <Box className={style.summary}>
            <Typography className={style.name}>{name}</Typography>
            <Typography className={style.count}>{`${count?.toLocaleString()} / ${total?.toLocaleString()}`}</Typography>
          </Box>
          <LinearProgress className={style.progressBar} variant='determinate' value={(count / total) * 100} />
        </Box>
      ))}
    </Box>
  );
};
export default Principles;
