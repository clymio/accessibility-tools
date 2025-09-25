'use strict';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import IconButton from '../IconButton';
import AccordionFormRow from './AccordionFormRow.component';
import styles from './AccordionTableRow.module.scss';

export default function AccordionTableRow({ title, subTitle, chips, hover, disabled = false, actions }) {
  const [actionsVisible, setActionsVisible] = useState(false);
  return (
    <AccordionFormRow
      onHover={setActionsVisible}
      className={styles.root}
      actions={
        actions
          ? (
            <div className={styles.actions}>
              {!actionsVisible || disabled
                ? (
                  <IconButton disabled={disabled} className={styles.toggleActions} Icon='more' variant='text' onClick={() => setActionsVisible(true)} />
                  )
                : (
                    actions
                  )}
            </div>
            )
          : undefined
      }
      title={(
        <div className={styles.fullTitle}>
          <Typography sx={{ lineHeight: '18px' }} variant='body1' className={styles.first}>
            {title}
          </Typography>
          {subTitle && (
            <Typography className={styles.subTitle} sx={{ lineHeight: '15px' }} variant='body2'>
              {subTitle}
            </Typography>
          )}
        </div>
      )}
      hover={hover}
      extended={true}
      titleChip={chips}
    />
  );
}
