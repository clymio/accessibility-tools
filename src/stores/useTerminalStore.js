import { create } from 'zustand';

const createTableState = (filter = {}) => ({
  data: [],
  sort: {},
  filter: {},
  pagination: {},
  meta: {}
});

const createSlice
  = (key, filter = {}) =>
    (set, get) => ({
      ...createTableState(filter),
      setData: data =>
        set({
          [key]: { ...get()[key], data }
        }),
      setFilter: newFilter =>
        set({
          [key]: {
            ...get()[key],
            filter: newFilter,
            pagination: { ...get()[key].pagination, page: 1 }
          }
        }),
      setSort: sort =>
        set({
          [key]: { ...get()[key], sort }
        }),
      setPagination: pagination =>
        set({
          [key]: { ...get()[key], pagination }
        }),
      setMeta: meta =>
        set({
          [key]: { ...get()[key], meta }
        }),
      reset: () =>
        set({
          [key]: { ...get()[key], ...createTableState() }
        })
    });

const initialState = {
  clickedTargetContext: { prev: null, curr: null },
  filter: {},
  page_id: null,
  test_id: null,
  isAudit: false,
  isPolling: false,
  isAutomatedTestFinished: false,
  hideTerminal: false,
  hasOccurrenceData: true
};

const testsSlice = createSlice('tests', { status: 'FAIL' });
const remediationsSlice = createSlice('remediations');

export const useTerminalStore = create((set, get) => ({
  ...initialState,
  setClickedTargetContext: clickedTargetContext => set({ clickedTargetContext }),
  setFilter: (filter) => {
    const { tests, remediations } = get();
    const newTests = { ...tests, pagination: { ...tests.pagination, page: 1 } };
    const newRemediations = { ...remediations, pagination: { ...remediations.pagination, page: 1 } };
    set({ filter, tests: newTests, remediations: newRemediations });
  },
  setPageId: page_id => set({ page_id }),
  setTestId: test_id => set({ test_id }),
  setIsAudit: isAudit => set({ isAudit }),
  setIsPolling: isPolling => set({ isPolling }),
  setIsAutomatedTestFinished: isAutomatedTestFinished => set({ isAutomatedTestFinished }),
  setHideTerminal: hideTerminal => set({ hideTerminal }),
  setHasOccurrenceData: hasOccurrenceData => set({ hasOccurrenceData }),
  tests: {
    ...testsSlice(set, get),
    fetchData: async () => {
      const {
        tests: { pagination, filter: testsFilter, sort },
        filter,
        page_id,
        test_id,
        isAudit
      } = get();
      if ((!isAudit && !page_id) || page_id === 'HOME' || !test_id) return;
      const testCaseNodesRes = await window.api.environmentPage.findTestCaseNodes(
        {
          environment_page_id: page_id ?? '',
          environment_test_id: test_id,
          ...pagination,
          ...filter,
          ...testsFilter,
          sort
        },
        { count: true }
      );
      const { result, meta } = testCaseNodesRes;
      set({ tests: { ...get().tests, data: result, meta } });
    }
  },
  remediations: {
    ...remediationsSlice(set, get),
    pagination: {
      limit: 25,
      page: 1
    },
    fetchData: async () => {
      const {
        remediations: { pagination, filter: remediationsFilter, sort },
        filter,
        page_id,
        test_id
      } = get();
      if (!page_id || page_id === 'HOME' || !test_id) return;
      if (!Object.keys(pagination).length) {
        pagination.limit = 25;
        pagination.page = 1;
      }
      const testCaseNodesRes = await window.api.environmentPage.findTestCaseNodes(
        {
          environment_page_id: page_id,
          environment_test_id: test_id,
          has_remediation: true,
          ...pagination,
          ...filter,
          ...remediationsFilter,
          sort
        },
        { count: true }
      );
      const { result, meta } = testCaseNodesRes;
      set({ remediations: { ...get().remediations, data: result, meta } });
    }
  },
  reset: () => {
    set(initialState);
    get().tests.reset();
    get().remediations.reset();
  },
  refresh: async () => {
    const { tests, remediations } = get();
    await Promise.all([
      tests.fetchData(),
      remediations.fetchData()
    ]);
  }
}));
