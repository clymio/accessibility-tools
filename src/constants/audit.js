export const AUDIT_ITEM_CHAPTER_TYPES = {
  WEB: 'WEB',
  DOCS: 'DOCS',
  SOFTWARE: 'SOFTWARE',
  AUTHORING_TOOL: 'AUTHORING_TOOL',
  FULL: 'FULL'
};
export const AUDIT_ITEM_TYPE_VALUES = Object.values(AUDIT_ITEM_CHAPTER_TYPES);
export const AUDIT_ITEM_LEVEL_VALUES = ['SUPPORT', 'PARTIAL_SUPPORT', 'NOT_SUPPORTED', 'NOT_APPLICABLE', 'NOT_EVALUATED', 'PASSED', 'FAILED', 'CANNOT_TELL'];

export const LEVEL_OPTIONS_WCAG_ATAG = [
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'NOT_APPLICABLE', label: 'Not applicable' },
  { value: 'NOT_EVALUATED', label: 'Not evaluated' },
  { value: 'CANNOT_TELL', label: 'Cannot tell' }
];

export const LEVEL_OPTIONS_VPAT = [
  { value: 'SUPPORT', label: 'Supports' },
  { value: 'PARTIAL_SUPPORT', label: 'Partially supports' },
  { value: 'NOT_SUPPORTED', label: 'Does not support' },
  { value: 'NOT_APPLICABLE', label: 'Not applicable' },
  { value: 'NOT_EVALUATED', label: 'Not evaluated' }
];

export const LEVELS = {
  PASSED: 'Passed',
  FAILED: 'Failed',
  SUPPORT: 'Supports',
  PARTIAL_SUPPORT: 'Partially supports',
  NOT_SUPPORTED: 'Does not support',
  NOT_APPLICABLE: 'Not applicable',
  NOT_EVALUATED: 'Not evaluated',
  CANNOT_TELL: 'Cannot tell'
};

export const CONFORMANCE_TYPE_LABELS = {
  AUTHORING_TOOL: 'Authoring Tool',
  DOCS: 'Electronic Docs',
  SOFTWARE: 'Software',
  WEB: 'Web'
};
