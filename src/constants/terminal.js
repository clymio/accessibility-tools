export const TEST_CASE_POLLING_TIME = 1000;

export const TERMINAL_TEST_CASE_HEADINGS = [
  { id: 'type', label: '', maxWidth: '30px' },
  { id: 'id', label: 'Test code', maxWidth: '160px' },
  { id: 'html', label: 'HTML', minWidth: '140px' },
  { id: 'selector', label: 'Selector', minWidth: '140px' },
  { id: 'result', label: 'Result', not_sortable: true }
];

export const TERMINAL_AUDIT_TEST_CASE_HEADINGS = [
  { id: 'type', label: '', maxWidth: '30px' },
  { id: 'id', label: 'Test code', maxWidth: '160px' },
  { id: 'html', label: 'HTML', minWidth: '300px' },
  { id: 'selector', label: 'Selector', minWidth: '140px' },
  { id: 'page', label: 'Page', minWidth: '100px' },
  { id: 'result', label: 'Result', not_sortable: true }
];

export const TERMINAL_REMEDIATION_HEADINGS = [
  { id: 'id', label: 'Remediation code' },
  { id: 'name', label: 'Name' },
  { id: 'category', label: 'Category', minWidth: '140px' },
  { id: 'target', label: 'Target', minWidth: '140px' }
];

export const TERMINAL_TEST_CASE_STATUS_OPTIONS = [
  {
    label: 'Failed',
    value: 'FAIL'
  },
  {
    label: 'Passed',
    value: 'PASS'
  },
  {
    label: 'Not run',
    value: 'MANUAL'
  },
  {
    label: 'Inconclusive',
    value: 'INCOMPLETE'
  }
];

export const TERMINAL_TEST_CASE_LEVEL_OPTIONS = [
  { label: 'A', value: 'A' },
  { label: 'AA', value: 'AA' },
  { label: 'AAA', value: 'AAA' }
];

export const TERMINAL_TEST_DETAIL_STATUS_OPTIONS = [
  {
    label: 'Failed',
    value: 'FAIL'
  },
  {
    label: 'Passed',
    value: 'PASS'
  },
  {
    label: 'Not Run',
    value: 'MANUAL'
  },
  {
    label: 'Inconclusive',
    value: 'INCOMPLETE'
  }
];

export const TERMINAL_SECTIONS = {
  TESTS: 'TESTS',
  REMEDIATIONS: 'REMEDIATIONS'
};
