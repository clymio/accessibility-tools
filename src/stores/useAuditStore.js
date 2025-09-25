import { create } from 'zustand';

const initialState = {
  audit: null,
  selectedCriterion: null,
  isPageLoading: false
};

export const useAuditStore = create(set => ({
  ...initialState,
  setAudit: audit => set({ audit }),
  setSelectedCriterion: selectedCriterion => set({ selectedCriterion }),
  reset: () => set(initialState)
}));
