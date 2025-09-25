'use strict';
import { Fragment } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const SKELETON_VARIANTS = ['caption', 'caption', 'caption'];

export default function AccordionSkeleton() {
  return (
    <Fragment>
      {SKELETON_VARIANTS.map((variant, i) => (
        <Typography component='div' key={i} variant={variant}>
          <Skeleton />
        </Typography>
      ))}
    </Fragment>
  );
}
