import { useEffect, useState } from 'react';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon';
import styles from './RemediationCategoryForm.module.scss';
import classNames from 'classnames';
import { TextField } from '@mui/material';
import { useSnackbarStore } from '@/stores';
import { circlePlus, edit3 } from '@/assets/icons';

export default function RemediationCategoryForm({ open, onClose, onRemediationCategoryAdded, remediationCategoryId }) {
  const {
    openSnackbar
  } = useSnackbarStore();

  const [remediationCategoryName, setRemediationCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formMode, setFormMode] = useState('add');

  useEffect(() => {
    if (open) {
      if (remediationCategoryId) {
        setFormMode('edit');
        const fetchRemediationCategory = async () => {
          try {
            const data = await window.api.systemCategory.read({ id: remediationCategoryId });
            setRemediationCategoryName(data.name);
          } catch (error) {
            console.error('Error fetching remediation category:', error);
          }
        };
        fetchRemediationCategory();
      } else {
        setFormMode('add');
      }
    }
  }, [open, remediationCategoryId]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setRemediationCategoryName('');
    setErrors({});
    setTouched({});
  };

  const validateField = (field, value) => {
    if (!value.trim()) {
      return 'Remediation category name is required';
    }
    return undefined;
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    if (!remediationCategoryName.trim()) {
      setErrors({ remediationCategoryName: 'Remediation category name is required' });
      setTouched({ remediationCategoryName: true });
      setIsSubmitting(false);
      return;
    }

    try {
      if (formMode === 'edit') {
        await window.api.systemCategory.update({ id: remediationCategoryId, name: remediationCategoryName });
      } else {
        await window.api.systemCategory.create({ name: remediationCategoryName });
      }
      openSnackbar({ message: 'Remediation category saved successfully', severity: 'success' });
      handleClose();
      onRemediationCategoryAdded?.();
    } catch (error) {
      openSnackbar({ message: 'Failed to save remediation category' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={formMode === 'edit' ? 'Edit remediation category' : 'Add remediation category'}
        titleIcon={formMode === 'edit'
          ? <Icon icon={edit3} className={styles.edit} showShadow={true} />
          : <Icon icon={circlePlus} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={classNames(styles.dialogHeader, { [styles.dialogHeaderEdit]: formMode === 'edit' })}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: formMode === 'edit' ? 'Save' : 'Create',
          backLabel: 'Cancel',
          isSubmitting,
          onBack: onClose
        }}
        className={styles.dialogContentContainer}
        classes={{
          container: styles.dialogContainer,
          muiSvgIcon: styles.icon
        }}
        PaperProps={{
          style: {
            height: 'fit-content',
            minHeight: '25%',
            maxHeight: '80%',
            minWidth: '660px',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '12px',
            overflow: 'auto',
            padding: 0
          }
        }}
      >
        <div className={styles.form}>
          <div className={styles.formField}>
            <TextField
              label='Remediation category name'
              required
              value={remediationCategoryName}
              onChange={e => setRemediationCategoryName(e.target.value)}
              onBlur={e => handleBlur('remediationCategoryName', e.target.value)}
              fullWidth
              margin='normal'
              className={styles.textField}
              error={touched?.remediationCategoryName && Boolean(errors.remediationCategoryName)}
              helperText={touched?.remediationCategoryName && errors.remediationCategoryName}
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
