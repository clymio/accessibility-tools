import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon';
import ProgressBar from '@/modules/core/ProgressBar';
import { useSnackbarStore } from '@/stores';
import { useAuditFormStore } from '@/stores/useAuditFormStore';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import styles from './AuditForm.module.scss';
import StepFour from './StepFour.component';
import StepOne from './StepOne.component';
import StepThree from './StepThree.component';
import StepTwo from './StepTwo.component';

import { circlePlus, edit3 } from '@/assets/icons';
export default function AuditForm({ open, onClose, onAuditAdded, auditId, triggerEl }) {
  const {
    step,
    reportType,
    wcagVersion,
    conformanceTarget,
    reportIdentifier,
    reportDate,
    auditVersion,
    chapters,
    project,
    environmentType,
    test,
    product,
    vendor,
    evaluator,
    evaluation,
    executiveSummary,
    setAuditId,
    setReportType,
    setWcagVersion,
    setConformanceTarget,
    setReportIdentifier,
    setReportDate,
    setAuditVersion,
    setChapters,
    setProject,
    setEnvironmentType,
    setTest,
    setProduct,
    setVendor,
    setEvaluator,
    setEvaluation,
    setExecutiveSummary,
    validateForm,
    resetForm,
    markAllAsTouched,
    isSubmitting,
    setStep,
    setIsSubmitting
  } = useAuditFormStore();

  const {
    openSnackbar
  } = useSnackbarStore();

  const triggerRef = useRef(triggerEl);

  useEffect(() => {
    if (!triggerEl) return;
    triggerRef.current = triggerEl;
  }, [triggerEl]);

  const [audit, setAudit] = useState({});

  const setAuditData = async () => {
    if (audit) {
      setAuditId(audit.id);
      setReportType(audit.system_audit_type_id);
      setWcagVersion(audit.wcagVersion);
      setConformanceTarget(audit.conformance_target);
      setReportIdentifier(audit.identifier);
      setReportDate(audit.start_date);
      setAuditVersion(audit.system_audit_type_version_id);
      setChapters(audit.chapters?.map(ch => typeof ch === 'string' ? ch : ch.id));
      setProject(audit.project_id);
      setEnvironmentType(audit.environment_id);
      setTest(audit.environment_test_id);
      setProduct({
        name: audit.product_name,
        version: audit.product_version,
        description: audit.product_description,
        website: audit.product_url
      });
      setVendor({
        name: audit.vendor_name,
        address: audit.vendor_address,
        website: audit.vendor_url,
        contactName: audit.vendor_contact_name,
        contactEmail: audit.vendor_contact_email,
        contactPhone: audit.vendor_contact_phone
      });
      setEvaluator(audit.profile_id);
      setEvaluation(audit.evaluation);
      setEvaluation({
        notes: audit.notes,
        methods: audit.methods,
        legalDisclaimer: audit.disclaimer,
        repository: audit.repository_url,
        feedback: audit.feedback,
        license: audit.license
      });
      setExecutiveSummary(audit.summary);
    }
  };

  useEffect(() => {
    if (!open || !auditId) return;
    const fetchAudit = async () => {
      const audit = await window.api.audit.read({ id: auditId });
      setAudit(audit);
    };
    setStep(1);
    fetchAudit();
  }, [open, auditId]);

  useEffect(() => {
    if (audit) {
      resetForm();
      setAuditData();
    }
  }, [audit]);

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
    markAllAsTouched();
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
        conformance_target: conformanceTarget,
        wcag_version: wcagVersion,
        identifier: reportIdentifier,
        project_id: project,
        environment_id: environmentType,
        environment_test_id: test,
        profile_id: evaluator,
        audit_type_id: reportType,
        audit_type_version_id: null,
        audit_chapters: reportType === 'ATAG'
          ? chapters.filter(id => !id.startsWith('WCAG_'))
          : chapters,
        start_date: new Date(reportDate).toISOString(),
        product_name: product.name,
        product_version: product.version,
        product_description: product.description,
        product_url: product.website,
        vendor_name: vendor.name,
        vendor_address: vendor.address,
        vendor_url: vendor.website,
        vendor_contact_name: vendor.contactName,
        vendor_contact_email: vendor.contactEmail,
        vendor_contact_phone: vendor.contactPhone,
        notes: evaluation.notes,
        methods: evaluation.methods,
        disclaimer: evaluation.legalDisclaimer,
        repository_url: evaluation.repository,
        feedback: evaluation.feedback,
        license: evaluation.license,
        summary: executiveSummary
      };

      if (reportType === 'VPAT') {
        payload.audit_type_version_id = auditVersion;
      }

      if (auditId) {
        payload.id = auditId;
      }

      let audit;
      if (auditId) {
        audit = await window.api.audit.update(payload);
      } else {
        audit = await window.api.audit.create(payload);
      }

      await onAuditAdded?.(auditId ? null : audit);
      resetForm();
      onClose();
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    } catch (err) {
      openSnackbar({ message: 'Failed to create audit.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      label: 'Step 1',
      component: <StepOne />
    },
    ...(!auditId
      ? [{
          label: 'Step 2',
          component: <StepTwo isEdit={!!auditId} />
        }]
      : []),
    {
      label: 'Step 3',
      component: (
        <StepThree />
      )
    },
    {
      label: 'Step 4',
      component: (
        <StepFour />
      )
    }
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={auditId ? 'Edit audit' : 'Add audit'}
        titleIcon={auditId ? <Icon icon={edit3} className={styles.edit} showShadow={true} /> : <Icon icon={circlePlus} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={classNames(styles.dialogHeader, { [styles.dialogHeaderEdit]: auditId })}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleSubmit}
        actionsConfig={{
          nextLabel: step === steps.length ? (auditId ? 'Save' : 'Create') : 'Continue',
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
