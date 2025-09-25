import { circlePlus, edit3 } from '@/assets/icons';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import ProgressBar from '@/modules/core/ProgressBar';
import { useSnackbarStore, useTestCaseFormStore } from '@/stores';
import classNames from 'classnames';
import { useEffect } from 'react';
import StepOne from './StepOne.component';
import StepTwo from './StepTwo.component';
import styles from './TestCaseForm.module.scss';

export default function AddTestCase({ open, onClose, onTestCaseAdded, testCaseId, duplicateTest }) {
  const {
    step,
    setStep,
    resetForm,
    validateForm,
    isSubmitting,
    setIsSubmitting,
    testName,
    testType,
    reproductionSteps,
    expectedResult,
    additionalInstructions,
    selectors,
    standard,
    criteria,
    setTestName,
    setTestType,
    setReproductionSteps,
    setExpectedResult,
    setAdditionalInstructions,
    setSelectors,
    setStandard,
    setCriteria
  } = useTestCaseFormStore();

  const { openSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (open && testCaseId) {
      const fetchTestCase = async () => {
        const data = await window.api.testCase.read({ id: testCaseId });
        setTestName(data.name);
        setTestType(data.type);
        setReproductionSteps(data.steps);
        setExpectedResult(data.result);
        setAdditionalInstructions(data.instruction);
        setSelectors(data.selectors);
        setStandard(data.standard.id);
        setCriteria(data.criteria.map(item => item.id));
      };

      fetchTestCase();
    }
  }, [open, testCaseId]);

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

    try {
      const payload = {
        name: testName,
        type: testType || null,
        steps: reproductionSteps || null,
        result: expectedResult || null,
        instruction: additionalInstructions || null,
        selectors: selectors || null,
        system_standard_id: standard,
        system_standard_criteria: criteria
      };

      if (testCaseId && !duplicateTest) {
        payload.id = testCaseId;
      }

      if (testCaseId && !duplicateTest) {
        await window.api.testCase.update(payload);
      } else {
        await window.api.testCase.create(payload);
      }

      onTestCaseAdded?.();
      resetForm();
      onClose();
    } catch (err) {
      openSnackbar({ message: 'Failed to create test case.' });
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
        title={duplicateTest ? 'Duplicate test case' : testCaseId ? 'Edit test case' : 'Add test case'}
        titleIcon={
          testCaseId && !duplicateTest ? <Icon icon={edit3} className={styles.edit} showShadow={true} /> : <Icon icon={circlePlus} className={styles.icon} showShadow={true} />
        }
        dialogHeaderClassName={classNames(styles.dialogHeader, { [styles.dialogHeaderEdit]: testCaseId && !duplicateTest })}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? (testCaseId ? 'Save' : 'Create') : 'Continue',
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
