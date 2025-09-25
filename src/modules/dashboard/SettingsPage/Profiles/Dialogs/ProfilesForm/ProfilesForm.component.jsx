import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon';
import ProgressBar from '@/modules/core/ProgressBar';
import { useSnackbarStore } from '@/stores';
import { useProfileFormStore } from '@/stores/useProfileFormStore';
import classNames from 'classnames';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './ProfilesForm.module.scss';
import StepOne from './StepOne.component';
import { circlePlus, edit3 } from '@/assets/icons';

export default function ProfilesForm({ open = false, onClose = () => {}, onProfileAdded = () => {}, profileId = null }) {
  const {
    step,
    image,
    setImage,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    title,
    setTitle,
    isOrganization,
    setIsOrganization,
    organization,
    setOrganization,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    setStep,
    validateForm
  } = useProfileFormStore();

  const {
    openSnackbar
  } = useSnackbarStore();

  useEffect(() => {
    if (open && profileId) {
      const fetchProfile = async () => {
        const data = await window.api.profile.read({ id: profileId });
        resetForm();
        setStep(1);
        setImage(data.image);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setTitle(data.title);

        const hasOrg = Boolean(data.organization);
        setIsOrganization(hasOrg);

        if (hasOrg) {
          setOrganization({
            ...data.organization,
            country: data.organization?.country?.id || '',
            state: data.organization?.state?.id || ''
          });
        }
      };

      fetchProfile();
    }
  }, [open, profileId]);

  useEffect(() => {
    if (open) {
      resetForm();
      setStep(1);
    }
  }, [open, setStep]);

  const handleBack = (e) => {
    if (step === 1) {
      resetForm();
      onClose(e);
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    let isValid = validateForm();

    if (!isValid) {
      openSnackbar({ message: 'Please fix the errors before submitting.' });
      setIsSubmitting(false);
      return;
    }
    if (step < steps.length) {
      setStep(step + 1);
      setIsSubmitting(false);
      return;
    }

    const organizationData = {
      ...organization
    };

    delete organizationData.id;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      title: title,
      image: image
    };

    if (isOrganization) {
      payload.organization = organizationData;
    }

    if (profileId) {
      payload.id = profileId;
    }

    try {
      if (profileId) {
        await window.api.profile.update(payload);
      } else {
        await window.api.profile.create(payload);
      }
      onProfileAdded?.();
      resetForm();
      onClose(e);
    } catch (err) {
      openSnackbar({ message: 'Failed to create profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      label: 'Step 2',
      component: <DndProvider backend={HTML5Backend}><StepOne /></DndProvider>
    }
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={profileId ? 'Edit profile' : 'Add profile'}
        titleIcon={profileId ? <Icon icon={edit3} className={styles.edit} showShadow={true} /> : <Icon icon={circlePlus} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={classNames(styles.dialogHeader, { [styles.dialogHeaderEdit]: profileId })}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? (profileId ? 'Save' : 'Create') : 'Continue',
          backLabel: step === 1 ? 'Cancel' : 'Back',
          isSubmitting,
          onBack: handleBack
        }}
        className={styles.dialogContentContainer}
        classes={{
          container: styles.dialogContainer,
          muiSvgIcon: styles.icon
        }}
        PaperProps={{
          style: {
            height: 'fit-content',
            minHeight: '65%',
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
        {steps.length > 1 && (
          <ProgressBar totalSteps={steps.length} currentStep={step} />
        )}

        {steps[step - 1] && steps[step - 1].component}
      </Dialog>
    </>
  );
}
