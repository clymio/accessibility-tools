import { create } from 'zustand';

const initialState = {
  testCases: [],
  selectedTestCases: [],
  sort: {},
  filter: {},
  pagination: {},
  meta: {},
  checkedFilters: {},
  openFilterItems: {}
};

export const useTestCasesStore = create(set => ({
  ...initialState,
  setTestCases: testCases => set({ testCases }),
  addTestCase: testCase => set(state => ({ testCases: [...state.testCases, testCase] })),
  deleteTestCase: id => set(state => ({ testCases: state.testCases.filter(t => t.id !== id) })),
  updateTestCase: (id, testCase) => set(state => ({ testCases: state.testCases.map(t => (t.id === id ? testCase : t)) })),
  setSelectedTestCases: selectedTestCases => set({ selectedTestCases }),
  addSelectedTestCase: testCase => set(state => ({ selectedTestCases: [...state.selectedTestCases, testCase] })),
  removeSelectedTestCase: id => set(state => ({ selectedTestCases: state.selectedTestCases.filter(t => t.id !== id) })),
  setSort: sort => set({ sort }),
  setFilter: filter => set({ filter }),
  setPagination: newPagination => set(state => ({ pagination: { ...state.pagination, ...newPagination } })),
  setMeta: meta => set({ meta }),
  setCheckedFilters: checkedFilters => set({ checkedFilters }),
  setOpenFilterItems: openFilterItems => set({ openFilterItems })
}));
