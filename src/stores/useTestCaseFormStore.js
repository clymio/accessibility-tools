import { create } from 'zustand';

export const useTestCaseFormStore = create((set, get) => ({
  step: 1,
  testName: '',
  reproductionSteps: '',
  expectedResult: '',
  additionalInstructions: '',
  selectors: '',
  category: '',
  standard: '',
  criteria: [],
  testType: 'manual',
  errors: {
    testName: false,
    standard: false,
    criteria: false,
    testType: false
  },
  touched: {
    testName: false,
    standard: false,
    criteria: false,
    testType: false
  },
  isSubmitting: false,

  setStep: newStep => set({ step: newStep }),
  setTestName: testName => set({ testName }),
  setReproductionSteps: reproductionSteps => set({ reproductionSteps }),
  setExpectedResult: expectedResult => set({ expectedResult }),
  setAdditionalInstructions: additionalInstructions => set({ additionalInstructions }),
  setSelectors: selectors => set({ selectors }),

  setStandard: (standard) => {
    const { errors } = get();
    set({
      standard,
      errors: { ...errors, standard: standard ? false : 'Standard is required' }
    });
  },

  setCriteria: criteria => set({ criteria }),

  setTestType: (testType) => {
    const { errors } = get();
    set({
      testType,
      errors: { ...errors, testType: testType ? false : 'Test type is required' }
    });
  },

  setCategory: category => set({ category }),

  setErrors: errors => set({ errors }),
  setTouched: touched => set({ touched }),
  setIsSubmitting: isSubmitting => set({ isSubmitting }),

  handleChange: (value, field, index = null, arrayType = null) => {
    const { errors, validateField } = get();
    const updatedError = validateField(field, value);
    set({
      [field]: value,
      errors: { ...errors, [field]: updatedError ? updatedError : false }
    });
  },

  handleBlur: (field, value, index = null, arrayType = null) => {
    const { touched, errors, validateField } = get();
    set({
      touched: { ...touched, [field]: true },
      errors: { ...errors, [field]: validateField(field, value) }
    });
  },

  validateField: (field, value) => {
    switch (field) {
      case 'testName':
        return value.trim() === '' ? 'Test name is required' : '';
      case 'testTarget':
        return !value || value.trim() === '' ? 'Test target is required' : '';
      case 'standard':
        return !value ? 'Standard is required' : '';
      case 'testType':
        return !value ? 'Test type is required' : '';
      default:
        return false;
    }
  },

  validateForm: () => {
    const {
      testName,
      standard,
      testType,
      validateField,
      setErrors,
      setTouched,
      step
    } = get();

    const fieldErrors = {};
    const touchedFields = {};

    if (step === 1) {
      fieldErrors.testName = validateField('testName', testName);
      touchedFields.testName = true;
    } else {
      fieldErrors.standard = validateField('standard', standard);
      fieldErrors.testType = validateField('testType', testType);

      touchedFields.standard = true;
      touchedFields.testType = true;
    }

    setErrors(fieldErrors);
    setTouched(touchedFields);

    const hasErrors = Object.values(fieldErrors).some((error) => {
      if (Array.isArray(error)) {
        return error.some((e) => {
          if (typeof e === 'object' && e !== null) {
            return Object.values(e).some(v => !!v);
          }
          return !!e;
        });
      }
      return !!error;
    });

    return !hasErrors;
  },

  resetForm: () =>
    set({
      step: 1,
      testName: '',
      reproductionSteps: '',
      expectedResult: '',
      additionalInstructions: '',
      selectors: '',
      category: '',
      standard: '',
      criteria: [],
      testType: 'manual',
      errors: {
        testName: false,
        standard: false,
        criteria: false,
        testType: false
      },
      touched: {
        testName: false,
        standard: false,
        criteria: false,
        testType: false
      }
    })
}));
