import { isDomainValid } from '@/electron/lib/utils';
import { create } from 'zustand';

export const useProjectTestFormStore = create((set, get) => ({
  step: 1,
  testName: '',
  environmentType: null,
  essentialFunctionality: '',
  webPageTypes: '',
  structuredPages: [{ id: '', label: '' }],
  randomPages: [{ id: '', label: '' }],
  errors: {
    testName: false,
    environmentType: false,
    essentialFunctionality: false,
    webPageTypes: false,
    structuredPages: [false],
    randomPages: [false]
  },
  touched: {
    testName: false,
    environmentType: false,
    essentialFunctionality: false,
    webPageTypes: false,
    structuredPages: [false],
    randomPages: [false]
  },
  isSubmitting: false,

  setStep: newStep => set({ step: newStep }),
  setTestName: testName => set({ testName }),
  setEnvironmentType: environmentType => set({ environmentType }),
  setEssentialFunctionality: essentialFunctionality => set({ essentialFunctionality }),
  setWebPageTypes: webPageTypes => set({ webPageTypes }),

  setStructuredPages: structuredPages => set({ structuredPages }),
  setRandomPages: randomPages => set({ randomPages }),

  setErrors: errors => set({ errors }),
  setTouched: touched => set({ touched }),
  setIsSubmitting: isSubmitting => set({ isSubmitting }),

  addStructuredPage: () => {
    const { structuredPages, touched, errors } = get();
    set({
      structuredPages: [...structuredPages, { id: '', label: '' }],
      touched: {
        ...touched,
        structuredPages: Array.isArray(touched.structuredPages)
          ? [...touched.structuredPages, false]
          : [false]
      },
      errors: {
        ...errors,
        structuredPages: Array.isArray(errors.structuredPages)
          ? [...errors.structuredPages, false]
          : [false]
      }
    });
  },

  removeStructuredPage: (index) => {
    const { structuredPages, touched, errors } = get();
    const updatedErrors = Array.isArray(errors.structuredPages)
      ? errors.structuredPages.filter((_, i) => i !== index)
      : [];
    set({
      structuredPages: structuredPages.filter((_, i) => i !== index),
      touched: {
        ...touched,
        structuredPages: (Array.isArray(touched.structuredPages) ? touched.structuredPages : []).filter((_, i) => i !== index)
      },
      errors: {
        ...errors,
        structuredPages: updatedErrors
      }
    });
  },

  addRandomPage: () => {
    const { randomPages, touched, errors } = get();
    set({
      randomPages: [...randomPages, { id: '', label: '' }],
      touched: {
        ...touched,
        randomPages: Array.isArray(touched.randomPages)
          ? [...touched.randomPages, false]
          : [false]
      },
      errors: {
        ...errors,
        randomPages: Array.isArray(errors.randomPages)
          ? [...errors.randomPages, false]
          : [false]
      }
    });
  },

  removeRandomPage: (index) => {
    const { randomPages, touched, errors } = get();
    const updatedErrors = Array.isArray(errors.randomPages)
      ? errors.randomPages.filter((_, i) => i !== index)
      : [];
    set({
      randomPages: randomPages.filter((_, i) => i !== index),
      touched: {
        ...touched,
        randomPages: (Array.isArray(touched.randomPages) ? touched.randomPages : []).filter((_, i) => i !== index)
      },
      errors: {
        ...errors,
        randomPages: updatedErrors
      }
    });
  },

  handleChange: (field, value, index = null, arrayType = null) => {
    const { structuredPages, randomPages, errors, validateField } = get();

    if (arrayType === 'structuredPages' || arrayType === 'randomPages') {
      const updatedArray = arrayType === 'structuredPages' ? [...structuredPages] : [...randomPages];
      updatedArray[index] = value;

      const updatedErrors = {
        structuredPages: structuredPages.map(page => validateField('structuredPage', page)),
        randomPages: randomPages.map(page => validateField('randomPage', page))
      };
      set({
        [arrayType]: updatedArray,
        errors: { ...errors, ...updatedErrors }

      });
    } else {
      const updatedError = validateField(field, value);

      set({
        [field]: value,
        errors: { ...errors, [field]: updatedError }
      });
    }
  },

  validateField: (field, value) => {
    switch (field) {
      case 'testName':
        return value.trim() === '' ? 'Test name is required' : '';
      case 'structuredPage':
      case 'randomPage':
        if (!value.label) return 'Page selection is required';
        // need dns check here too
        if (!value.id && value.label && !isDomainValid(value.label)) return 'Invalid domain URL';
        return '';
      default:
        return false;
    }
  },

  handleBlur: (field, value, index = null, arrayType = null) => {
    const { step, touched, errors, validateField } = get();

    if (step === 1 && ['testName', 'environmentType', 'essentialFunctionality'].includes(field)) {
      set({
        touched: { ...touched, [field]: true },
        errors: { ...errors, [field]: validateField(field, value) }
      });
    } else if (step === 2 && arrayType === 'structuredPages') {
      const updatedTouched = [...touched.structuredPages];
      const updatedErrors = [...errors.structuredPages];

      updatedTouched[index] = true;
      updatedErrors[index] = validateField('structuredPage', value);

      set({
        touched: { ...touched, structuredPages: updatedTouched },
        errors: { ...errors, structuredPages: updatedErrors }
      });
    } else if (step === 3 && arrayType === 'randomPages') {
      const updatedTouched = [...touched.randomPages];
      const updatedErrors = [...errors.randomPages];

      updatedTouched[index] = true;
      updatedErrors[index] = validateField('randomPage', value);

      set({
        touched: { ...touched, randomPages: updatedTouched },
        errors: { ...errors, randomPages: updatedErrors }
      });
    }
  },

  validateForm: () => {
    const { step, testName, environmentType, essentialFunctionality, structuredPages, randomPages, validateField, setErrors, setTouched } = get();

    let errors = {};
    let touched = {};

    if (step === 1) {
      errors = {
        testName: validateField('testName', testName),
        environmentType: validateField('environmentType', environmentType),
        essentialFunctionality: validateField('essentialFunctionality', essentialFunctionality)
      };
      touched = {
        testName: true,
        environmentType: true,
        essentialFunctionality: true
      };
    } else if (step === 2) {
      errors = {
        structuredPages: structuredPages.map(page => validateField('structuredPage', page))
      };
      touched = {
        structuredPages: structuredPages.map(() => true)
      };
    } else if (step === 3) {
      errors = {
        randomPages: randomPages.map(page => validateField('randomPage', page))
      };
      touched = {
        randomPages: randomPages.map(() => true)
      };
    }

    setErrors(errors);
    setTouched(touched);

    const hasErrors = Object.values(errors).some(error =>
      Array.isArray(error) ? error.some(Boolean) : Boolean(error)
    );

    return !hasErrors;
  },

  resetForm: () =>
    set({
      step: 1,
      testName: '',
      environmentType: null,
      essentialFunctionality: '',
      webPageTypes: '',
      structuredPages: [{ id: '', label: '' }],
      randomPages: [{ id: '', label: '' }],
      errors: {
        testName: false,
        environmentType: false,
        essentialFunctionality: false,
        webPageTypes: false,
        structuredPages: [false],
        randomPages: [false]
      },
      touched: {
        testName: false,
        environmentType: false,
        essentialFunctionality: false,
        webPageTypes: false,
        structuredPages: [false],
        randomPages: [false]
      }
    })
}));
