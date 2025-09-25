import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import styles from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectTest/CloseTest.module.scss';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { alertCircle } from '@/assets/icons';

export default function CloseTest({ open, onClose, testId, onCloseSuccess }) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
    }
  }, [open]);

  const handleCheckboxChange = (event) => {
    setIsConfirmed(event.target.checked);
  };

  const handleCloseTest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await window.api.environmentTest.close({ id: testId });
      onCloseSuccess();
      onClose();
    } catch (e) {
      console.error('Error closing test:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CustomCheckboxIcon = ({ isChecked }) => (
    <div className={`${styles.checkboxBase}`}>
      {isChecked && (
        <span className={styles.checkboxX}>
          <Typography variant='body2'>X</Typography>
        </span>
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={(
        <>
          <Typography variant='body1' component='span'>You are about to close the test</Typography>
          <Typography variant='body2' component='span'>Are you sure you want to close this test?</Typography>
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
      onSubmit={handleCloseTest}
      dialogFormClassName='delete'
      actionsConfig={{
        onBack: onClose,
        isDelete: true,
        disabled: !isConfirmed,
        nextLabel: 'Close',
        isSubmitting: isSubmitting
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
