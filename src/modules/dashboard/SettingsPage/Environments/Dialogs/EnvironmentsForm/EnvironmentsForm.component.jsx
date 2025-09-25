import { useEffect, useState } from 'react';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon';
import styles from './EnvironmentsForm.module.scss';
import classNames from 'classnames';
import { useSnackbarStore } from '@/stores';
import { TextField } from '@mui/material';
import { circlePlus, edit3 } from '@/assets/icons';

export default function EnvironmentsForm({ open, onClose, onEnvironmentAdded, environmentId }) {
  const {
    openSnackbar
  } = useSnackbarStore();

  const [environmentName, setEnvironmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open && environmentId) {
      const fetchEnvironment = async () => {
        try {
          const data = await window.api.systemEnvironment.read({ id: environmentId });
          setEnvironmentName(data.name);
        } catch (error) {
          console.error('Error fetching environment:', error);
        }
      };
      fetchEnvironment();
    }
  }, [open, environmentId]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setEnvironmentName('');
    setErrors({});
    setTouched({});
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [field]: 'Environment name is required' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    if (!environmentName.trim()) {
      setErrors({ environmentName: 'Environment name is required' });
      setTouched({ environmentName: true });
      setIsSubmitting(false);
      return;
    }

    try {
      if (environmentId) {
        await window.api.systemEnvironment.update({ id: environmentId, name: environmentName });
      } else {
        await window.api.systemEnvironment.create({ name: environmentName });
      }
      openSnackbar({ message: 'Environment saved successfully', severity: 'success' });
      onEnvironmentAdded();
      handleClose();
    } catch (error) {
      openSnackbar({ message: 'Failed to save environment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={environmentId ? 'Edit environment' : 'Add environment'}
        titleIcon={environmentId
          ? <Icon icon={edit3} className={styles.edit} showShadow={true} />
          : <Icon icon={circlePlus} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={classNames(styles.dialogHeader, { [styles.dialogHeaderEdit]: environmentId })}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: environmentId ? 'Save' : 'Create',
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
              label='Environment name'
              required
              value={environmentName}
              onChange={e => setEnvironmentName(e.target.value)}
              onBlur={e => handleBlur('environmentName', e.target.value)}
              fullWidth
              margin='normal'
              className={styles.textField}
              error={touched?.environmentName && Boolean(errors.environmentName)}
              helperText={touched?.environmentName && errors.environmentName}
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
