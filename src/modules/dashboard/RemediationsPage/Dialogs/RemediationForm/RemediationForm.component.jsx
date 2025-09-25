import { circlePlus, edit3 } from '@/assets/icons';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon';
import ProgressBar from '@/modules/core/ProgressBar';
import { useRemediationFormStore, useSnackbarStore } from '@/stores';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './RemediationForm.module.scss';
import StepOne from './StepOne.component';
import StepTwo from './StepTwo.component';

export default function RemediationForm({ open = false, onClose = () => {}, onRemediationAdded = () => {}, remediationId = null, duplicateRemediation = false }) {
  const {
    step,
    setStep,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    resetForm,
    remediationName,
    setRemediationName,
    remediationDescription,
    setRemediationDescription,
    selectors,
    setSelectors,
    examples,
    setExamples,
    category,
    setCategory,
    criteria,
    setCriteria,
    tests,
    setTests
  } = useRemediationFormStore();

  const { openSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (open && remediationId) {
      const fetchRemediation = async () => {
        const data = await window.api.remediation.read({ id: remediationId });
        setRemediationName(data.name);
        setRemediationDescription(data.description);
        setSelectors(data.selectors);
        setExamples(data.examples);
        setCategory(data.system_category_id);
        setCriteria(data.criteria.map(item => item.id));
        setTests(data.test_cases.map(item => item.id));
      };
      fetchRemediation();
    }
  }, [open, remediationId]);

  useEffect(() => {
    if (open) {
      resetForm();
      setStep(1);
    }
  }, [open, setStep]);

  const handleBack = () => {
    if (step === 1) {
      resetForm();
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    const isValid = validateForm();

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

    const payload = {
      name: remediationName,
      description: remediationDescription,
      selectors,
      examples: duplicateRemediation ? examples.map(({ id, ...rest }) => rest) : examples,
      system_category_id: category,
      system_criteria: criteria,
      test_cases: tests
    };

    if (remediationId && !duplicateRemediation) {
      payload.id = remediationId;
    }

    try {
      if (remediationId && !duplicateRemediation) {
        await window.api.remediation.update(payload);
      } else {
        await window.api.remediation.create(payload);
      }
      onRemediationAdded?.();
      resetForm();
      onClose();
    } catch (err) {
      openSnackbar({
        message: remediationId && !duplicateRemediation ? 'Failed to update remediation.' : 'Failed to create remediation.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      label: 'Step 1',
      component: <StepOne />
    },
    {
      label: 'Step 2',
      component: <StepTwo />
    }
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={duplicateRemediation ? 'Duplicate remediation' : remediationId ? 'Edit remediation' : 'Add remediation'}
        titleIcon={
          remediationId && !duplicateRemediation
            ? (
              <Icon icon={edit3} className={styles.edit} showShadow={true} />
              )
            : (
              <Icon icon={circlePlus} className={styles.icon} showShadow={true} />
              )
        }
        dialogHeaderClassName={classNames(styles.dialogHeader, { [styles.dialogHeaderEdit]: remediationId && !duplicateRemediation })}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? (remediationId ? 'Save' : 'Create') : 'Continue',
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
        <ProgressBar totalSteps={steps.length} currentStep={step} />
        {steps[step - 1] && steps[step - 1].component}
      </Dialog>
    </>
  );
}
