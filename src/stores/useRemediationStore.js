import { create } from 'zustand';

const initialState = {
  remediations: [],
  selectedRemediations: [],
  sort: {},
  filter: {},
  pagination: {},
  meta: {},
  checkedFilters: {},
  openFilterItems: {}
};

export const useRemediationsStore = create(set => ({
  ...initialState,
  setRemediations: remediations => set({ remediations }),
  addRemediation: remediation => set(state => ({ remediations: [...state.remediations, remediation] })),
  deleteRemediation: id => set(state => ({ remediations: state.remediations.filter(t => t.id !== id) })),
  updateRemediation: (id, remediation) => set(state => ({ remediations: state.remediations.map(r => (r.id === id ? remediation : r)) })),
  setSelectedRemediations: selectedRemediations => set({ selectedRemediations }),
  addSelectedRemediation: remediation => set(state => ({ selectedRemediations: [...state.selectedRemediations, remediation] })),
  removeSelectedRemediation: id => set(state => ({ selectedRemediations: state.selectedRemediations.filter(r => r.id !== id) })),
  setSort: sort => set({ sort }),
  setFilter: filter => set({ filter }),
  setPagination: newPagination => set(state => ({ pagination: { ...state.pagination, ...newPagination } })),
  setMeta: meta => set({ meta }),
  setCheckedFilters: checkedFilters => set({ checkedFilters }),
  setOpenFilterItems: openFilterItems => set({ openFilterItems })
}));
