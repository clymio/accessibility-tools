import { isDomainValid } from '@/electron/lib/utils';
import { useSystemStore } from '@/stores/useSystemStore';
import { create } from 'zustand';

export const useProjectFormStore = create((set, get) => ({
  step: 1,
  logInStep: 1,
  projectId: '',
  connected: false,
  projectName: '',
  envDomains: [{ environment: 'Production', domain: '' }],
  errors: { envDomains: [{ environment: '', domain: '' }] },
  touched: { envDomains: [{ environment: false, domain: false }] },
  email: '',
  domain: '',
  code: '',
  technologies: [],
  isSubmitting: false,
  essentialFunctionality: '',
  webPageTypes: '',
  initialEnvDomains: [],

  setStep: newStep =>
    set((state) => {
      const stepsCount = state.connected ? 3 : 2;
      return {
        step: Math.min(Math.max(newStep, 1), stepsCount)
      };
    }),
  setLogInStep: logInStep => set({ logInStep }),
  setProjectId: projectId => set({ projectId }),
  setConnected: connected => set({ connected }),
  setProjectName: projectName => set({ projectName }),
  setEnvDomains: envDomains => set({ envDomains }),
  setErrors: errors => set({ errors }),
  setTouched: touched => set({ touched }),
  setEmail: email => set({ email }),
  setDomain: domain => set({ domain }),
  setCode: code => set({ code }),
  setTechnologies: (technology) => {
    set({ technologies: technology });
  },
  setEssentialFunctionality: essentialFunctionality => set({ essentialFunctionality }),
  setWebPageTypes: webPageTypes => set({ webPageTypes }),
  setInitialEnvDomains: initialEnvDomains => set({ initialEnvDomains }),
  setIsSubmitting: isSubmitting => set({ isSubmitting }),

  resetForm: () =>
    set({
      step: 1,
      logInStep: 1,
      connected: false,
      projectId: '',
      projectName: '',
      envDomains: [{ environment: 'Production', domain: '' }],
      errors: { projectName: false, envDomains: [] },
      touched: { projectName: false, envDomains: [] },
      email: '',
      domain: '',
      code: '',
      technologies: [],
      essentialFunctionality: '',
      webPageTypes: '',
      isSubmitting: false
    }),

  validateField: (field, value) => {
    if (field === 'domain') {
      return !isDomainValid(value);
    }
    return value?.trim() === '';
  },

  handleBlur: (field, value, index = null) => {
    const { touched, errors, validateField } = get();

    if (index !== null) {
      const updatedTouched = { ...touched, envDomains: [...touched.envDomains] };
      updatedTouched.envDomains[index] = { ...updatedTouched.envDomains[index], [field]: true };

      const updatedErrors = { ...errors, envDomains: [...errors.envDomains] };
      updatedErrors.envDomains[index] = { ...updatedErrors.envDomains[index], [field]: validateField(field, value) ? 'Domain must be a valid URL' : '' };

      set({ touched: updatedTouched, errors: updatedErrors });
    } else {
      set({
        touched: { ...touched, [field]: true },
        errors: { ...errors, [field]: validateField(field, value) }
      });
    }
  },

  handleChange: (field, value, index = null) => {
    const { envDomains, errors, validateField, setErrors, setEnvDomains } = get();
    if (index !== null) {
      const updatedEnvDomains = [...envDomains];
      updatedEnvDomains[index][field] = value;

      const updatedErrors = [...errors.envDomains];
      updatedErrors[index] = {
        ...updatedErrors[index],
        [field]: validateField(field, value) ? 'Domain must be a valid URL' : ''
      };

      setEnvDomains(updatedEnvDomains);
      setErrors({ ...errors, envDomains: updatedErrors });
    } else {
      const updatedErrors = { ...errors, [field]: validateField(field, value) };
      set({ [field]: value, errors: updatedErrors });
    }
  },

  addEnvDomain: async () => {
    const { environments } = useSystemStore.getState();
    set((state) => {
      const allEnvironments = environments.map(env => env.name);
      const usedEnvironments = state.envDomains.map(env => env.environment);
      const nextAvailableEnvironment = allEnvironments.find(env => !usedEnvironments.includes(env)) || '';
      const newEnvDomains = [...state.envDomains, { environment: nextAvailableEnvironment, domain: '' }];
      const newErrors = [...state.errors.envDomains, { environment: '', domain: '' }];
      const newTouched = [...state.touched.envDomains, { environment: false, domain: false }];
      return {
        envDomains: newEnvDomains,
        errors: { ...state.errors, envDomains: newErrors },
        touched: { ...state.touched, envDomains: newTouched }
      };
    });
  },

  removeEnvDomain: (index) => {
    set(state => ({
      envDomains: state.envDomains.filter((_, i) => i !== index),
      touched: {
        ...state.touched,
        envDomains: state.touched.envDomains.filter((_, i) => i !== index)
      },
      errors: {
        ...state.errors,
        envDomains: state.errors.envDomains.filter((_, i) => i !== index)
      }
    }));
  },

  validateForm: () => {
    const { projectName, envDomains, validateField, setErrors, setTouched } = get();

    const envErrors = envDomains.map(env => ({
      environment: validateField('environment', env.environment),
      domain: validateField('domain', env.domain) ? 'Domain must be a valid URL' : ''
    }));

    const hasErrors = validateField('projectName', projectName) || envErrors.some(env => env.environment || env.domain);

    setErrors({
      projectName: validateField('projectName', projectName),
      envDomains: envErrors
    });

    setTouched({
      projectName: true,
      envDomains: envDomains.map(() => ({ environment: true, domain: true }))
    });

    return !hasErrors;
  }
}));
