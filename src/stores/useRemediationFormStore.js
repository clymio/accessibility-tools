import { create } from 'zustand';

export const useRemediationFormStore = create((set, get) => ({
  step: 1,
  remediationName: '',
  remediationDescription: '',
  selectors: '',
  examples: [{ name: '', description: '', code: '' }],
  category: '',
  criteria: [],
  tests: [],
  errors: {
    remediationName: false,
    remediationDescription: false,
    selectors: false,
    examples: [false],
    category: false,
    criteria: false
  },
  touched: {
    remediationName: false,
    remediationDescription: false,
    selectors: false,
    examples: [false],
    category: false,
    criteria: false
  },
  isSubmitting: false,

  setStep: newStep => set({ step: newStep }),
  setRemediationName: (remediationName) => {
    const { errors } = get();
    set({
      remediationName,
      errors: { ...errors, remediationName: remediationName ? false : 'Remediation name is required' }
    });
  },
  setRemediationDescription: remediationDescription => set({ remediationDescription }),
  setSelectors: selectors => set({ selectors }),
  setExamples: examples => set({ examples }),
  setCategory: category => set({ category }),
  setCriteria: criteria => set({ criteria }),
  setTests: tests => set({ tests }),
  setErrors: errors => set({ errors }),
  setTouched: touched => set({ touched }),
  setIsSubmitting: isSubmitting => set({ isSubmitting }),

  validateField: (field, value) => {
    switch (field) {
      case 'remediationName':
        return value.trim() === '' ? 'Remediation name is required' : '';
      case 'examples':
        return value.map(example => ({
          name: example.name.trim() ? '' : 'Example name is required',
          description: '',
          code: ''
        }));
      default:
        return false;
    }
  },

  validateForm: () => {
    const { remediationName, examples, validateField, setErrors, setTouched, step } = get();

    let errors = {};
    let touched = {};

    if (step === 1) {
      errors = {
        remediationName: validateField('remediationName', remediationName),
        examples: validateField('examples', examples)
      };
      touched = {
        remediationName: true,
        examples: examples.map(() => ({
          name: true,
          description: true,
          code: true
        }))
      };
    } else {
    }

    setErrors(errors);
    setTouched(touched);

    const hasErrors = Object.values(errors).some(error => (Array.isArray(error) ? error.some(errObj => Object.values(errObj).some(Boolean)) : Boolean(error)));

    return !hasErrors;
  },

  handleChange: (field, value, index = null) => {
    set((state) => {
      if (index !== null) {
        const updatedExamples = state.examples.map((example, i) => (i === index ? { ...example, [field]: value } : example));
        const updatedErrors = state.errors?.examples?.map((error, i) => (i === index ? { ...error, [field]: value.trim() ? '' : `${field} is required` } : error));
        return {
          examples: updatedExamples,
          errors: { ...state.errors, examples: updatedErrors }
        };
      } else {
        return { [field]: value };
      }
    });
  },

  handleBlur: (field, index = null) => {
    const formatFieldName = (field) => {
      const formatted = field
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    set((state) => {
      if (index !== null) {
        const updatedTouched = state.touched?.examples?.map((example, i) => (i === index ? { ...example, [field]: true } : example));

        const updatedErrors = state.errors?.examples?.map((error, i) =>
          i === index ? { ...error, [field]: state.examples[i][field].trim() ? '' : `${formatFieldName(field)} is required` } : error
        );

        return {
          touched: { ...state.touched, examples: updatedTouched },
          errors: { ...state.errors, examples: updatedErrors }
        };
      } else {
        const updatedTouched = { ...state.touched, [field]: true };
        const updatedErrors = {
          ...state.errors,
          [field]: state[field]?.trim() === '' ? `${formatFieldName(field)} is required` : ''
        };

        return {
          touched: updatedTouched,
          errors: updatedErrors
        };
      }
    });
  },

  addExample: async () => {
    set(state => ({
      examples: [...state.examples, { name: '', description: '', code: '' }],
      touched: {
        ...state.touched,
        examples: [...state.touched.examples, { name: false, description: false, code: false }]
      },
      errors: {
        ...state.errors,
        examples: [...state.errors.examples, { name: '', description: '', code: '' }]
      }
    }));
  },

  removeExample: (index) => {
    set((state) => {
      const updatedExamples = state.examples.filter((_, i) => i !== index);
      const updatedTouched = state.touched.examples.filter((_, i) => i !== index);
      const updatedErrors = state.errors.examples.filter((_, i) => i !== index);
      return {
        examples: updatedExamples,
        touched: { ...state.touched, examples: updatedTouched },
        errors: { ...state.errors, examples: updatedErrors }
      };
    });
  },

  resetForm: () =>
    set({
      step: 1,
      remediationName: '',
      remediationDescription: '',
      selectors: '',
      examples: [{ name: '', description: '', code: '' }],
      category: '',
      criteria: [],
      tests: [],
      errors: {
        remediationName: false,
        remediationDescription: false,
        selectors: false,
        examples: [false],
        category: false,
        criteria: false
      },
      touched: {
        remediationName: false,
        remediationDescription: false,
        selectors: false,
        examples: [false],
        category: false,
        criteria: false
      }
    })
}));
