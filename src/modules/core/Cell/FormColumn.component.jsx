'use strict';
import { useUiStore } from '@/stores';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { BulletCell, TooltipCell } from '.';
import styles from './Cell.module.scss';

export default function FormColumn({
  label,
  labelAlign = 'center',
  labelXs = 5,
  align = 'center',
  description,
  style,
  tooltip,
  helperText,
  inner = false,
  innerBullet = true,
  className,
  children
}) {
  const { theme } = useUiStore();
  const sx = {};
  if (labelAlign !== 'center') sx.paddingTop = '8px';
  return (
    <Grid
      container
      spacing={2}
      style={style}
      alignItems={labelAlign}
      className={classNames(className, styles.formColumn, {
        [styles.alignCenter]: align === 'center'
      })}
    >
      <Grid item xs={labelXs}>
        <Typography
          variant='body1'
          sx={sx}
          className={classNames({
            [styles.inner]: inner
          })}
        >
          {inner && innerBullet && <BulletCell color={theme.palette.primary.main} />}
          {inner && !innerBullet && <span>&nbsp; &nbsp; &nbsp;</span>}
          {label} {tooltip && <TooltipCell color='primary' title={tooltip} />}
          {description}
        </Typography>
        {helperText && <FormHelperText sx={{ marginLeft: 0 }}>{helperText}</FormHelperText>}
      </Grid>
      <Grid item xs={labelXs === 12 ? 12 : 12 - labelXs}>
        {children}
      </Grid>
    </Grid>
  );
}
