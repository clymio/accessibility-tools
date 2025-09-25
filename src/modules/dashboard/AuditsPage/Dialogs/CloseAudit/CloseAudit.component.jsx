import { useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import Dialog from '@/modules/core/Dialog';
import styles from './CloseAudit.module.scss';
import Icon from '@/modules/core/Icon/Icon.component';
import { alertCircle } from '@/assets/icons';

export default function CloseAudit({ open, onClose, audit, onCloseSuccess }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
    }
  }, [open]);

  const handleCheckboxChange = (event) => {
    setIsConfirmed(event.target.checked);
  };

  const handleAuditClose = async () => {
    try {
      const result = await window.api.audit.update({ id: audit.id, status: 'CLOSED' });
      if (result) {
        onCloseSuccess();
        onClose();
      }
    } catch (e) {
      console.error('Error closing audit:', e);
    }
  };

  const CustomCheckboxIcon = ({ isChecked }) => (
    <div className={`${styles.checkboxBase}`}>
      {isChecked && <span className={styles.checkboxX}><Typography variant='body2'>X</Typography></span>}
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={(
        <>
          <Typography variant='body1' component='span'>You are about to close the audit</Typography>
          <Typography variant='body2' component='span'>Are you sure you want to close this audit?</Typography>
        </>
      )}
      titleIcon={(
        <div className={styles.iconContainer}>
          <Icon icon={alertCircle} color='error' className={styles.icon} showShadow={true} />
        </div>
      )}
      dialogHeaderClassName={styles.dialogHeader}
      dialogContentClassName={styles.dialogContent}
      dialogActionsClassName={styles.dialogActions}
      dialogContainerClassName={styles.dialogContainer}
      dialogContentContainer={styles.dialogContentContainer}
      onSubmit={handleAuditClose}
      dialogFormClassName='delete'
      actionsConfig={{
        onBack: onClose,
        nextLabel: 'Close',
        isDelete: true,
        disabled: !isConfirmed
      }}
      PaperProps={{
        style: {
          height: 'fit-content',
          padding: '24px',
          borderRadius: '12px'
        }
      }}
    >
      <FormControlLabel
        control={(
          <Checkbox
            checked={isConfirmed}
            onChange={handleCheckboxChange}
            className={styles.checkbox}
            icon={<CustomCheckboxIcon isChecked={false} />}
            checkedIcon={<CustomCheckboxIcon isChecked={true} />}
          />
        )}
        label='Yes, I’m sure'
      />
    </Dialog>
  );
}
