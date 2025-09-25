import Dialog from '@/modules/core/Dialog';
import {
  Checkbox,
  FormControlLabel,
  Typography
} from '@mui/material';
import styles from '@/modules/dashboard/ProjectsPage/Dialogs/DeleteProject/DeleteProject.module.scss';
import Icon from '@/modules/core/Icon/Icon.component';
import { alertCircle } from '@/assets/icons';
import { useEffect, useState } from 'react';

export default function DeleteProject({ open, onClose, project, onDeleteSuccess, triggerEl }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
    }
  }, [open]);

  const handleCheckboxChange = (event) => {
    setIsConfirmed(event.target.checked);
  };

  const handleProjectDelete = async () => {
    try {
      const result = await window.api.project.delete({ id: project.id });
      if (result.success) {
        onDeleteSuccess();
        onClose();
      }
    } catch (e) {
      console.error('Error deleting project:', e);
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
          <Typography variant='body1' component='span'>You are about to delete the project</Typography>
          <Typography variant='body2' component='span'>Are you sure you want to delete this project?</Typography>
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
      onSubmit={handleProjectDelete}
      dialogFormClassName='delete'
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
      triggerEl={triggerEl}
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
