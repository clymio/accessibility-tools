import { create } from 'zustand';

const initialState = {
  environments: [],
  selectedEnvironments: [],
  sort: {},
  filter: {},
  pagination: {},
  meta: {},
  checkedFilters: {},
  openFilterItems: {}
};

export const useEnvironmentsStore = create(set => ({
  ...initialState,
  setEnvironments: environments => set({ environments }),
  addEnvironment: environment => set(state => ({ environments: [...state.environments, environment] })),
  deleteEnvironment: id => set(state => ({ environments: state.environments.filter(t => t.id !== id) })),
  updateEnvironment: (id, environment) => set(state => ({ environments: state.environments.map(r => (r.id === id ? environment : r)) })),
  setSelectedEnvironments: selectedEnvironments => set({ selectedEnvironments }),
  addSelectedEnvironment: environment => set(state => ({ selectedEnvironments: [...state.selectedEnvironments, environment] })),
  removeSelectedEnvironment: id => set(state => ({ selectedEnvironments: state.selectedEnvironments.filter(r => r.id !== id) })),
  setSort: sort => set({ sort }),
  setFilter: filter => set({ filter }),
  setPagination: newPagination => set(state => ({ pagination: { ...state.pagination, ...newPagination } })),
  setMeta: meta => set({ meta }),
  setCheckedFilters: checkedFilters => set({ checkedFilters }),
  setOpenFilterItems: openFilterItems => set({ openFilterItems })
}));
