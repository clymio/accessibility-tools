import { create } from 'zustand';

const initialState = {
  standards: [],
  criteria: [],
  categories: [],
  technologies: [],
  environments: [],
  countries: [],
  auditTypes: [],
  imageBasePath: ''
};

export const useSystemStore = create(set => ({
  ...initialState,
  setStandards: standards => set({ standards }),
  setCriteria: criteria => set({ criteria }),
  setCategories: categories => set({ categories }),
  setTechnologies: technologies => set({ technologies }),
  addTechnology: technology => set(state => ({ technologies: [...state.technologies, technology] })),
  removeTechnology: id => set(state => ({ technologies: state.technologies.filter(t => t.id !== id) })),
  setEnvironments: environments => set({ environments }),
  addEnvironment: environment => set(state => ({ environments: [...state.environments, environment] })),
  removeEnvironment: id => set(state => ({ environments: state.environments.filter(t => t.id !== id) })),
  setCountries: countries => set({ countries }),
  setAuditTypes: auditTypes => set({ auditTypes }),
  setImageBasePath: imageBasePath => set({ imageBasePath })
}));
