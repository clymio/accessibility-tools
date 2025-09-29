import { create } from 'zustand';

const initialState = {
  project: null,
  selectedPage: {
    id: 'HOME',
    name: 'Home',
    path: '/'
  },
  tests: [],
  selectedTest: null,
  isPageLoading: false,
  testStats: null
};

export const useProjectStore = create(set => ({
  ...initialState,
  setProject: project => set({ project }),
  setSelectedPage: page => set({ selectedPage: page }),
  setIsPageLoading: isLoading => set({ isPageLoading: isLoading }),
  setTests: tests => set({ tests }),
  setSelectedTest: test => set({ selectedTest: test }),
  setTestStats: testStats => set({ testStats }),
  getTestStats: async (testId) => {
    const newTestStats = await window.api.environmentTest.getStats({ id: testId });
    set({ testStats: newTestStats });
  },
  reset: () => set(initialState)
}));
