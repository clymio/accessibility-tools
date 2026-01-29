import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { useEffect, useState } from 'react';
import styles from './ProjectTest.module.scss';
import StepOne from './StepOne.component';
import StepThree from './StepThree.component';
import StepTwo from './StepTwo.component';
import { useSnackbarStore } from '@/stores';
import ProgressBar from '@/modules/core/ProgressBar';
import { circlePlus } from '@/assets/icons';

export default function DuplicateTest({ open, onClose, testId, project, onTestDuplicated }) {
  const {
    step,
    setStep,
    resetForm,
    validateForm,
    setTestName,
    setEnvironmentType,
    setEssentialFunctionality,
    setWebPageTypes,
    setStructuredPages,
    setRandomPages,
    testName,
    environmentType,
    essentialFunctionality,
    webPageTypes,
    structuredPages,
    randomPages,
    isSubmitting,
    setIsSubmitting
  } = useProjectTestFormStore();

  const { openSnackbar } = useSnackbarStore();

  const [environments, setEnvironments] = useState([]);

  const [test, setTest] = useState({});

  const setTestData = async () => {
    if (test) {
      setTestName(test.name || '');
      setEssentialFunctionality(test.functionality_note || '');
      setWebPageTypes(test.page_variety_note || '');
      setStructuredPages(test.structured_pages?.map(page => ({ ...page, label: page.name })) || []);
      setRandomPages(test.random_pages?.map(page => ({ ...page, label: page.name })) || []);

      const data = await window.api.environment.find({ project_id: project?.id });
      setEnvironments(data?.result || []);

      if (data?.result?.length > 0) {
        setEnvironmentType(data.result[0].id);
      } else {
        setEnvironmentType(null);
      }
    }
  };

  useEffect(() => {
    if (!open || !testId) return;
    const fetchTest = async () => {
      const test = await window.api.environmentTest.read({ id: testId });
      setTest(test);
    };
    setStep(1);
    fetchTest();
  }, [open, testId]);

  useEffect(() => {
    if (test) {
      resetForm();
      setTestData();
    }
  }, [test, project]);

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
    const requestData = {
      name: testName,
      structured_pages: structuredPages.filter(page => !page.not_clickable).map(page => page.id),
      random_pages: randomPages.filter(page => !page.not_clickable).map(page => page.id),
      functionality_note: essentialFunctionality,
      page_variety_note: webPageTypes,
      environment_id: environmentType
    };

    try {
      const duplicatedTest = await window.api.environmentTest.create(requestData, { start: true });
      onTestDuplicated?.(duplicatedTest);
      resetForm();
      onClose();
    } catch (err) {
      openSnackbar({ message: 'Failed to duplicate test.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: 'Step 1', component: <StepOne environments={environments} /> },
    { label: 'Step 2', component: <StepTwo /> },
    { label: 'Step 3', component: <StepThree /> }
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title='Duplicate test'
        titleIcon={<Icon icon={circlePlus} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={styles.dialogHeader}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? 'Save' : 'Continue',
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
        {steps[step - 1]?.component}
      </Dialog>
    </>
  );
}
