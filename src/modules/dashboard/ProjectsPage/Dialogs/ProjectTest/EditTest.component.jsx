import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import StepOne from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectTest/StepOne.component';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { useEffect, useState } from 'react';
import styles from './ProjectTest.module.scss';
import { useSnackbarStore } from '@/stores';

import { circlePlus, edit3 } from '@/assets/icons';

export default function EditTest({ open, onClose, testId, project, onTestUpdated }) {
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

    const requestData = {
      id: test.id,
      name: testName,
      structured_pages: structuredPages.filter(page => !page.not_clickable).map(page => page.id),
      random_pages: randomPages.filter(page => !page.not_clickable).map(page => page.id),
      functionality_note: essentialFunctionality,
      page_variety_note: webPageTypes,
      environment_id: environmentType
    };

    try {
      const updatedTest = await window.api.environmentTest.update(requestData);
      onTestUpdated?.(updatedTest);
      resetForm();
      onClose();
    } catch (err) {
      openSnackbar({ message: 'Failed to update test.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title='Edit test'
        titleIcon={<Icon icon={edit3} className={styles.edit} showShadow={true} />}
        dialogHeaderClassName={styles.dialogHeader}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: 'Save',
          backLabel: 'Cancel',
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
        <StepOne environments={environments} isEdit={true} />
      </Dialog>
    </>
  );
}
