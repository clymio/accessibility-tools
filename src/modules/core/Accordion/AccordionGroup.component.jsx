'use strict';

import {
  Fragment,
  useState,
  Children,
  cloneElement
} from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const SKELETON_VARIANTS = ['h4', 'h6', 'h6', 'h7'];
export default function AccordionGroup({
  className,
  disabled,
  sx,
  ready = true,
  expanded = null, // index of expanded accordion.
  children
}) {
  const [active, setActive] = useState(expanded);
  const items = [];
  const handleChange = (e, idx) => {
    if (e) setActive(idx);
    if (e === false && active === idx) setActive(null);
  };
  Children.forEach(children, (child, idx) => {
    if (!child || typeof child !== 'object') return;
    const clone = cloneElement(child, {
      ...child.props,
      group: true,
      key: idx,
      expanded: active === idx,
      onChange: e => handleChange(e, idx)
    });
    items.push(clone);
  });
  return (
    <Box className={className} sx={sx}>
      {ready
        ? items
        : (
          <Fragment>
            {SKELETON_VARIANTS.map((variant, i) => (
              <Typography component='div' key={i} variant={variant}>
                <Skeleton />
              </Typography>
            ))}
          </Fragment>
          )}
    </Box>
  );
}
