import { formatDomain } from '@/electron/lib/utils';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon/Icon.component';
import { useProjectFormStore } from '@/stores/useProjectFormStore';
import { useEffect } from 'react';
import styles from './ProjectForm.module.scss';
import StepOne from './StepOne.component';
import StepTwo from './StepTwo.component';
import { useSnackbarStore } from '@/stores';
import ProgressBar from '@/modules/core/ProgressBar';
import { circlePlus, edit3 } from '@/assets/icons';
import classNames from 'classnames';

export default function ProjectForm({ open, onClose, onProjectAdded, projectId }) {
  const {
    setProjectId,
    step,
    setStep,
    logInStep,
    setLogInStep,
    connected,
    technologies,
    essentialFunctionality,
    webPageTypes,
    initialEnvDomains,
    setConnected,
    setErrors,
    projectName,
    envDomains,
    errors,
    touched,
    resetForm,
    handleBlur,
    handleChange,
    addEnvironment,
    removeEnvironment,
    validateForm,
    isSubmitting,
    setIsSubmitting
  } = useProjectFormStore();

  const { openSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (open) {
      resetForm();
      setStep(1);
      if (projectId) {
        setProjectId(projectId);
      }
    }
  }, [open, setStep, projectId, setProjectId]);

  const handleBack = () => {
    if (step === 1) {
      resetForm();
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  const handleVerify = () => {
    if (logInStep === 2) {
      setStep(3);
    } else {
      setLogInStep(2);
    }
  };

  const handleSubmit = async (e) => {
    if (connected && step === 2) {
      if (logInStep === 1) {
        setLogInStep(2);
        return;
      }
    }

    if (step < steps.length) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    let isValid = validateForm();

    if (isValid) {
      for (let i = 0; i < envDomains.length; i++) {
        const envDomain = envDomains[i];
        const lookup = await window.api.environment.dnsLookup({ url: envDomain.domain });
        if (!lookup.success) {
          const newErrors = { ...errors };
          if (lookup.error === 'UNKNOWN_RESPONSE') {
            newErrors.envDomains[i].domain = 'Invalid content. Please enter a URL that returns HTML';
          } else {
            newErrors.envDomains[i].domain = 'DNS lookup failed. Please enter a valid URL';
          }
          setErrors(newErrors);
          isValid = false;
        }
      }
    }

    if (!isValid) {
      openSnackbar({ message: 'Please fix the errors before submitting.' });
      setIsSubmitting(false);
      return;
    }

    let payload = {
      name: projectName,
      connected: connected
    };

    if (projectId) {
      payload.id = projectId;
      payload.technologies = technologies;
      payload.essential_functionality = essentialFunctionality;
      payload.webpage_types = webPageTypes;
    }

    try {
      let project;
      if (projectId) {
        project = await window.api.project.update(payload);

        await Promise.all(
          initialEnvDomains.map(async (initialEnv) => {
            if (!envDomains.some(currentEnv => currentEnv.id === initialEnv.id)) {
              await window.api.environment.delete({ id: initialEnv.id });
            }
          })
        );

        await Promise.all(
          envDomains.map(async (envDomain) => {
            if (envDomain.id) {
              await window.api.environment.update({ id: envDomain.id, name: envDomain.environment, url: formatDomain(envDomain.domain) });
            } else {
              await window.api.environment.create({ project_id: project.id, name: envDomain.environment, url: formatDomain(envDomain.domain) });
            }
          })
        );
      } else {
        project = await window.api.project.create(payload);

        for (const envDomain of envDomains) {
          await window.api.environment.create({
            project_id: project.id,
            name: envDomain.environment,
            url: formatDomain(envDomain.domain)
          });
        }
      }

      onProjectAdded?.(projectId ? null : project);
      resetForm();
      onClose();
    } catch (err) {
      openSnackbar({ message: `Failed to ${projectId ? 'update' : 'create'} project.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = projectId
    ? [
        {
          label: 'Environments',
          component: (
            <StepTwo
              projectName={projectName}
              envDomains={envDomains}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              onAdd={addEnvironment}
              onRemove={removeEnvironment}
            />
          )
        }
      ]
    : [
        {
          label: 'Project Details',
          component: <StepOne connected={connected} onSelect={setConnected} />
        },
        {
          label: 'Environments',
          component: (
            <StepTwo
              projectName={projectName}
              envDomains={envDomains}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              onAdd={addEnvironment}
              onRemove={removeEnvironment}
            />
          )
        }
      ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={projectId ? 'Edit project' : 'Create new project'}
        titleIcon={<Icon icon={projectId ? edit3 : circlePlus} className={classNames(styles.icon, { [styles.edit]: projectId })} showShadow={true} />}
        dialogHeaderClassName={styles.dialogHeader}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? (projectId ? 'Save' : 'Create') : 'Continue',
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
