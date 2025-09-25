import { create } from 'zustand';
import { isDomainValid } from '@/electron/lib/utils';

export const useAuditFormStore = create((set, get) => ({
  step: 1,
  auditId: '',
  reportType: '',
  wcagVersion: '',
  conformanceTarget: '',
  reportIdentifier: '',
  reportDate: 0,
  auditVersion: '',
  hasInitializedChapters: false,
  chapters: [],
  project: '',
  environmentType: '',
  test: '',
  product: {
    name: '',
    version: '',
    description: '',
    website: ''
  },
  vendor: {
    name: '',
    address: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  },
  evaluator: '',
  evaluation: {
    notes: '',
    methods: '',
    legalDisclaimer: '',
    repository: '',
    feedback: '',
    license: ''
  },
  executiveSummary: '',
  isSubmitting: false,
  errors: {
    reportType: false,
    wcagVersion: false,
    conformanceTarget: false,
    reportIdentifier: false,
    reportDate: false,
    auditVersion: false,
    chapters: false,
    project: false,
    environmentType: false,
    test: false,
    product: {
      name: false,
      version: false,
      description: false,
      website: false
    },
    vendor: {
      name: false,
      address: false,
      website: false,
      contactName: false,
      contactEmail: false,
      contactPhone: false
    },
    evaluator: false,
    evaluation: {
      notes: false,
      methods: false,
      legalDisclaimer: false,
      repository: false,
      feedback: false,
      license: false
    },
    executiveSummary: false
  },
  touched: {
    reportType: false,
    wcagVersion: false,
    conformanceTarget: false,
    reportIdentifier: false,
    reportDate: false,
    auditVersion: false,
    chapters: false,
    project: false,
    environmentType: false,
    test: false,
    product: {
      name: false,
      version: false,
      description: false,
      website: false
    },
    vendor: {
      name: false,
      address: false,
      website: false,
      contactName: false,
      contactEmail: false,
      contactPhone: false
    },
    evaluator: false,
    evaluation: {
      notes: false,
      methods: false,
      legalDisclaimer: false,
      repository: false,
      feedback: false,
      license: false
    },
    executiveSummary: false
  },

  setStep: newStep => set({ step: newStep }),
  setAuditId: newAuditId => set({ auditId: newAuditId }),
  setReportType: newAuditType => set({ reportType: newAuditType }),
  setWcagVersion: newVersion => set({ wcagVersion: newVersion }),
  setConformanceTarget: newConformanceTarget => set({ conformanceTarget: newConformanceTarget }),
  setReportIdentifier: newReportIdentifier => set({ reportIdentifier: newReportIdentifier }),
  setReportDate: newReportDate => set({ reportDate: newReportDate }),
  setAuditVersion: newAuditVersion => set({ auditVersion: newAuditVersion }),
  setHasInitializedChapters: value => set({ hasInitializedChapters: value }),
  setChapters: newChapters => set({ chapters: newChapters }),
  setProject: newProject => set({ project: newProject }),
  setEnvironmentType: newEnvironmentType => set({ environmentType: newEnvironmentType }),
  setTest: newTest => set({ test: newTest }),
  setProduct: updates =>
    set(state => ({
      product: { ...state.product, ...updates }
    })),
  setVendor: updates =>
    set(state => ({
      vendor: { ...state.vendor, ...updates }
    })),
  setEvaluator: newEvaluator => set({ evaluator: newEvaluator }),
  setEvaluation: updates =>
    set(state => ({
      evaluation: { ...state.evaluation, ...updates }
    })),
  setExecutiveSummary: newExecutiveSummary => set({ executiveSummary: newExecutiveSummary }),

  setIsSubmitting: isSubmitting => set({ isSubmitting }),
  setErrors: errors => set({ errors }),
  setTouched: touched => set({ touched }),

  handleBlur: (field) => {
    set((state) => {
      const updatedTouched = { ...state.touched };

      if (field.startsWith('product.')) {
        const subfield = field.split('.')[1];
        updatedTouched.product = { ...state.touched.product, [subfield]: true };
      } else if (field.startsWith('vendor.')) {
        const subfield = field.split('.')[1];
        updatedTouched.vendor = { ...state.touched.vendor, [subfield]: true };
      } else if (field.startsWith('evaluation.')) {
        const subfield = field.split('.')[1];
        updatedTouched.evaluation = { ...state.touched.evaluation, [subfield]: true };
      } else {
        updatedTouched[field] = true;
      }

      return { touched: updatedTouched };
    });

    const state = get();
    const { step, reportIdentifier, reportDate, product, vendor, evaluation, errors } = state;
    const newErrors = { ...errors };

    const clearError = (key) => {
      if (key in newErrors) {
        delete newErrors[key];
      }
    };

    const setFieldError = (key, message) => {
      newErrors[key] = message;
    };

    if (step === 1) {
      if (field === 'reportIdentifier') {
        if (!reportIdentifier.trim()) {
          setFieldError('reportIdentifier', 'Report identifier is required');
        } else {
          clearError('reportIdentifier');
        }
      }

      if (field === 'reportDate') {
        if (!reportDate) {
          setFieldError('reportDate', 'Report date is required');
        } else {
          clearError('reportDate');
        }
      }
    }

    if (step > 1 && field === 'product.website') {
      if (product.website.trim() && !isDomainValid(product.website)) {
        newErrors.product = {
          ...errors.product,
          website: 'Invalid website URL'
        };
      } else {
        newErrors.product = {
          ...errors.product,
          website: false
        };
      }
    }

    if (step > 1 && field === 'vendor.website') {
      if (vendor.website.trim() && !isDomainValid(vendor.website)) {
        newErrors.vendor = {
          ...errors.vendor,
          website: 'Invalid website URL'
        };
      } else {
        newErrors.vendor = {
          ...errors.vendor,
          website: false
        };
      }
    }

    if (step > 1 && field === 'evaluation.repository') {
      if (evaluation.repository.trim() && !isDomainValid(evaluation.repository)) {
        newErrors.evaluation = {
          ...errors.evaluation,
          repository: 'Invalid repository URL'
        };
      } else {
        newErrors.evaluation = {
          ...errors.evaluation,
          repository: false
        };
      }
    }

    set({ errors: newErrors });
  },

  validateForm: () => {
    const { step, reportIdentifier, reportDate, product, vendor, evaluator, evaluation, touched } = get();
    let errors = {};
    let updatedTouched = { ...touched };

    if (step === 1) {
      if (!reportIdentifier.trim()) {
        errors.reportIdentifier = 'Report identifier is required';
        updatedTouched.reportIdentifier = true;
      }

      if (!reportDate) {
        errors.reportDate = 'Report date is required';
        updatedTouched.reportDate = true;
      }
    } else {
      let productErrors = {};
      if (product.website.trim() && !isDomainValid(product.website)) {
        productErrors.website = 'Invalid website URL';
      }
      if (vendor.website.trim() && !isDomainValid(vendor.website)) {
        productErrors.website = 'Invalid website URL';
      }
      if (evaluation.repository.trim() && !isDomainValid(evaluation.repository)) {
        errors.evaluation.repository = 'Invalid repository URL';
      }
      if (step === 4 && !evaluator) {
        errors.evaluator = 'An evaluator profile is required';
      }
      if (Object.keys(productErrors).length > 0) {
        errors.product = productErrors;
        updatedTouched.product = {
          website: true
        };
      }
    }

    set({ errors, touched: updatedTouched });
    return Object.keys(errors).length === 0;
  },

  markAllAsTouched: () => {
    const { step, reportType, auditVersion, conformanceTarget, reportIdentifier, reportDate, product, touched } = get();
    let updatedTouched = { ...touched };
    if (step === 1) {
      updatedTouched.reportType = true;

      if (reportType === 'VPAT') {
        updatedTouched.auditVersion = true;
      }

      if (auditVersion !== 'VPAT-2.5-508') {
        updatedTouched.conformanceTarget = true;
        updatedTouched.reportIdentifier = true;
      }

      updatedTouched.reportDate = true;
    } else {
      let productTouched = { ...touched.product };

      productTouched.name = true;
      productTouched.version = true;
      productTouched.description = true;
      productTouched.website = true;
      productTouched.website = true;

      updatedTouched.product = productTouched;
    }

    set({ touched: updatedTouched });
  },

  resetForm: () =>
    set({
      step: 1,
      auditId: '',
      reportType: '',
      wcagVersion: '',
      conformanceTarget: '',
      reportIdentifier: '',
      reportDate: 0,
      auditVersion: '',
      hasInitializedChapters: false,
      chapters: [],
      project: '',
      environmentType: '',
      test: '',
      product: {
        name: '',
        version: '',
        description: '',
        website: ''
      },
      vendor: {
        name: '',
        address: '',
        website: '',
        contactName: '',
        contactEmail: '',
        contactPhone: ''
      },
      evaluator: '',
      evaluation: {
        notes: '',
        methods: '',
        legalDisclaimer: '',
        repository: '',
        feedback: '',
        license: ''
      },
      executiveSummary: '',
      isSubmitting: false,
      errors: {
        reportType: false,
        wcagVersion: false,
        conformanceTarget: false,
        reportIdentifier: false,
        reportDate: false,
        auditVersion: false,
        chapters: false,
        project: false,
        environmentType: false,
        test: false,
        product: {
          name: false,
          version: false,
          description: false,
          website: false
        },
        vendor: {
          name: false,
          address: false,
          website: false,
          contactName: false,
          contactEmail: false,
          contactPhone: false
        },
        evaluator: false,
        evaluation: {
          notes: false,
          methods: false,
          legalDisclaimer: false,
          repository: false,
          feedback: false,
          license: false
        },
        executiveSummary: false
      },
      touched: {
        reportType: false,
        wcagVersion: false,
        conformanceTarget: false,
        reportIdentifier: false,
        reportDate: false,
        auditVersion: false,
        chapters: false,
        project: false,
        environmentType: false,
        test: false,
        product: {
          name: false,
          version: false,
          description: false,
          website: false
        },
        vendor: {
          name: false,
          address: false,
          website: false,
          contactName: false,
          contactEmail: false,
          contactPhone: false
        },
        evaluator: false,
        evaluation: {
          notes: false,
          methods: false,
          legalDisclaimer: false,
          repository: false,
          feedback: false,
          license: false
        },
        executiveSummary: false
      }
    })
}));
