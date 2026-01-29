import { circlePlus } from '@/assets/icons';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import ProgressBar from '@/modules/core/ProgressBar';
import StepOne from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectTest/StepOne.component';
import StepThree from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectTest/StepThree.component';
import StepTwo from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectTest/StepTwo.component';
import { useSnackbarStore } from '@/stores';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { useEffect, useRef, useState } from 'react';
import styles from './ProjectTest.module.scss';

export default function StartTest({ open, onClose, project, onTestStarted, triggerEl }) {
  const {
    step,
    setStep,
    resetForm,
    validateForm,
    setEnvironmentType,
    testName,
    webPageTypes,
    essentialFunctionality,
    structuredPages,
    randomPages,
    environmentType,
    isSubmitting,
    setIsSubmitting
  } = useProjectTestFormStore();

  const { openSnackbar } = useSnackbarStore();

  const [environments, setEnvironments] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const saveBtnRef = useRef(null);

  const fetchEnvironments = async () => {
    const data = await window.api.environment.find({ project_id: typeof project === 'string' ? project : project.id });
    setEnvironments(data?.result || []);
    if (data?.result?.length > 0) {
      setEnvironmentType(data.result[0].id);
    } else {
      setEnvironmentType(null);
    }
  };

  useEffect(() => {
    if (open && project) {
      setStep(1);
      setSelectedProject(project);
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      resetForm();
      fetchEnvironments();
    }
  }, [project]);

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
      const test = await window.api.environmentTest.create(requestData, { start: true });
      onTestStarted?.(test, selectedProject);
      resetForm();
      onClose(e);
    } catch (err) {
      openSnackbar({ message: 'Failed to start test.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: 'Step 1', component: <StepOne environments={environments} /> },
    { label: 'Step 2', component: <StepTwo saveBtnRef={saveBtnRef} /> },
    { label: 'Step 3', component: <StepThree saveBtnRef={saveBtnRef} /> }
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title='Start test'
        titleIcon={<Icon icon={circlePlus} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={styles.dialogHeader}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? 'Create' : 'Continue',
          backLabel: step === 1 ? 'Cancel' : 'Back',
          isSubmitting,
          onBack: handleBack
        }}
        nextRef={saveBtnRef}
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
        triggerEl={triggerEl}
      >
        <ProgressBar totalSteps={steps.length} currentStep={step} />
        {steps[step - 1]?.component}
      </Dialog>
    </>
  );
}
