import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './DeleteRemediationCategory.module.scss';
import { alertCircle } from '@/assets/icons';

export default function DeleteRemediationCategory({ open, onClose, remediationCategoryId, onDeleteSuccess }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
    }
  }, [open]);

  const handleCheckboxChange = (event) => {
    setIsConfirmed(event.target.checked);
  };

  const handleRemediationCategoryDelete = async () => {
    try {
      await window.api.systemCategory.delete({ id: remediationCategoryId });
      onDeleteSuccess();
      onClose();
    } catch (e) {
      console.error('Error deleting remediation category:', e);
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
          <Typography variant='body1' component='span'>You are about to delete the remediation category</Typography>
          <Typography variant='body2' component='span'>Are you sure you want to delete this remediation category?</Typography>
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
      dialogFormClassName='delete'
      onSubmit={handleRemediationCategoryDelete}
      actionsConfig={{
        onBack: onClose,
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
