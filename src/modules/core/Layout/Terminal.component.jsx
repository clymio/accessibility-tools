'use strict';
import { activity, clipboard, save } from '@/assets/icons';
import { TERMINAL_DEFAULT_HEIGHT_PERCENTAGE, TERMINAL_MAX_HEIGHT_PERCENTAGE, TERMINAL_MIN_HEIGHT } from '@/constants/app';
import {
  TERMINAL_AUDIT_TEST_CASE_HEADINGS,
  TERMINAL_REMEDIATION_HEADINGS,
  TERMINAL_SECTIONS,
  TERMINAL_TEST_CASE_HEADINGS,
  TERMINAL_TEST_CASE_LEVEL_OPTIONS,
  TERMINAL_TEST_CASE_STATUS_OPTIONS,
  TEST_CASE_POLLING_TIME
} from '@/constants/terminal';
import Chip from '@/modules/core/Chip';
import Icon from '@/modules/core/Icon';
import Select from '@/modules/core/Select';
import TablePagination from '@/modules/core/TablePagination';
import { useAuditStore, useProjectStore, useSnackbarStore, useSystemStore, useTerminalStore, useUiStore } from '@/stores';
import { Box, Button, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import ResizableBlock from '../ResizableBlock';
import Table from '../Table';
import { DRAWER_CONTENT_TYPE } from './RightDrawer.component';
import style from './Terminal.module.scss';

const StatusChip = ({ status, className = '' }) => {
  const LABELS = {
    PASS: {
      label: 'Passed',
      type: 'success'
    },
    FAIL: {
      label: 'Failed',
      type: 'error'
    },
    INCOMPLETE: {
      label: 'Inconclusive',
      type: 'warning'
    },
    MANUAL: {
      label: 'Not run',
      type: 'warning'
    },
    ERROR: {
      label: 'Error',
      type: 'error'
    }
  };
  if (!LABELS[status]) return null;
  if (status === 'IN_PROGRESS') {
    return <CircularProgress size={20} />;
  }
  const { label, type } = LABELS[status];
  return <Chip label={label} type={type} className={className} />;
};

const SectionTable = ({
  section = {},
  headings = [],
  rows = [],
  filterLabel = '',
  defaultLimit = null,
  onCompleted = () => {},
  handleRowClick = () => {},
  height,
  page_id,
  test_id
}) => {
  const { closeRightDrawer } = useUiStore();
  const { filter, setClickedTargetContext, isAudit } = useTerminalStore(state => ({
    tests: state.tests,
    filter: state.filter,
    clickedTargetContext: state.clickedTargetContext,
    setClickedTargetContext: state.setClickedTargetContext,
    isAudit: state.isAudit
  }));

  const { fetchData, meta, filter: sectionFilter, pagination, setPagination, sort, setSort } = section;

  const [isCompleted, setIsCompleted] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(false);

  const isLoading = isPolling || isDataFetching;
  const canResolve = page_id && page_id !== 'HOME' && test_id;

  const fetchTestStatus = async () => {
    if (isAudit) return true;
    if (!canResolve) return;
    const environmentTest = await window.api.environmentPage.findEnvironmentTest({
      environment_page_id: page_id,
      environment_test_id: test_id
    });
    return !!environmentTest?.end_date;
  };

  const handleSort = (field, direction) => {
    setSort({ field, direction });
  };

  const getDataHandler = async () => {
    setIsDataFetching(true);
    try {
      await fetchData();
    } catch (err) {}
    setIsDataFetching(false);
  };

  useEffect(() => {
    let intervalId;

    const pollStatus = async () => {
      try {
        const isCompleted = await fetchTestStatus();
        if (isCompleted) {
          clearInterval(intervalId);
          setIsPolling(false);
          onCompleted();
          await getDataHandler();
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(intervalId);
        setIsPolling(false);
      }
    };

    setIsPolling(false);
    intervalId = setInterval(pollStatus, TEST_CASE_POLLING_TIME);
    pollStatus(); // Run immediately

    return () => clearInterval(intervalId);
  }, [page_id, test_id, isAudit]);

  useEffect(() => {
    if (!isCompleted) return;
    getDataHandler();
  }, [pagination, filter, sectionFilter, sort, page_id, test_id, isCompleted]);

  useEffect(() => {
    setClickedTargetContext({ prev: null, curr: null, section: null });
    closeRightDrawer();
    return () => {
      setClickedTargetContext({ prev: null, curr: null, section: null });
      closeRightDrawer();
    };
  }, [page_id]);

  if (!isAudit && !canResolve) return;

  return (
    <>
      <Box className={style.tableWrapper}>
        <Table
          headings={headings}
          rows={rows}
          className={style.table}
          maxHeight={`calc(${height}px - 123px)`}
          sortable
          onSort={handleSort}
          onClick={handleRowClick}
          isLoading={isLoading}
        />
        <TablePagination
          showFilterInfo
          meta={meta}
          filter={pagination}
          onChange={setPagination}
          defaultLimit={defaultLimit}
          className={style.tablePagination}
          filterLabel={filterLabel}
        />
      </Box>
    </>
  );
};

const TestsTable = ({ page_id, test_id, height, isAuditTable = false }) => {
  const { tests, clickedTargetContext, setClickedTargetContext } = useTerminalStore(state => ({
    tests: state.tests,
    clickedTargetContext: state.clickedTargetContext,
    setClickedTargetContext: state.setClickedTargetContext
  }));

  const { data, setFilter } = tests;

  const { openRightDrawer } = useUiStore();

  const handleRowClick = (row) => {
    if (!row || !row.id) return;
    const tcNode = data.find(t => t.id === row.id);
    setClickedTargetContext({ prev: clickedTargetContext.curr, curr: tcNode, section: TERMINAL_SECTIONS.TESTS });
    openRightDrawer(DRAWER_CONTENT_TYPE.TEST_CASE_INFO);
  };

  const onCompleted = () => {
    setFilter({ status: 'FAIL' });
  };

  const rows = data.map((node) => {
    const testCase = node.test ? node.test.test_case : node;
    const html = node.html || '';
    const selector = node.selector || '';
    const pageName = isAuditTable ? node.test.environment_page.name || 'Loading…' : null;

    const baseItems = [
      {
        label: <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={testCase.type === 'MANUAL' ? clipboard : activity} />,
        tooltip: testCase.type === 'MANUAL' ? 'Manual' : 'Automatic',
        props: { sx: { width: '30px' } }
      },
      { label: testCase.id, tooltip: testCase.name, props: { sx: { width: '160px' } } },
      { label: html, tooltip: html, props: { sx: { maxWidth: '200px' } } },
      { label: selector, tooltip: selector, props: { sx: { maxWidth: '200px' } } }
    ];

    if (isAuditTable) {
      baseItems.push({
        label: pageName,
        tooltip: pageName,
        props: { sx: { maxWidth: '200px' } }
      });
    }

    baseItems.push({
      component: <StatusChip status={node.status} />,
      props: { sx: { textAlign: node.status === 'IN_PROGRESS' ? 'center' : 'left', maxWidth: '140px' } }
    });

    return {
      id: node.id,
      items: baseItems
    };
  });

  return (
    <SectionTable
      section={tests}
      headings={isAuditTable ? TERMINAL_AUDIT_TEST_CASE_HEADINGS : TERMINAL_TEST_CASE_HEADINGS}
      rows={rows}
      filterLabel='tests'
      onCompleted={onCompleted}
      handleRowClick={handleRowClick}
      height={height}
      page_id={page_id}
      test_id={test_id}
    />
  );
};

const RemediationsTable = ({ page_id, test_id, height }) => {
  const { remediations, clickedTargetContext, setClickedTargetContext } = useTerminalStore(state => ({
    remediations: state.remediations,
    filter: state.filter,
    clickedTargetContext: state.clickedTargetContext,
    setClickedTargetContext: state.setClickedTargetContext
  }));

  const { data } = remediations;

  const { openRightDrawer } = useUiStore();

  const handleRowClick = (row) => {
    if (!row || !row.id) return;
    const tcNode = data.find(t => t.id === row.id);
    setClickedTargetContext({ prev: clickedTargetContext.curr, curr: tcNode, section: TERMINAL_SECTIONS.REMEDIATIONS });
    openRightDrawer(DRAWER_CONTENT_TYPE.TEST_CASE_INFO);
  };

  const rows = data.map((node) => {
    const remediation = node.remediation;
    const html = node.html || '';
    return {
      id: node.id,
      items: [
        { label: remediation.id, props: { sx: { width: '180px' } } },
        { label: remediation.name, tooltip: remediation.name, props: { sx: { maxWidth: '200px' } } },
        { label: remediation.category.name, tooltip: remediation.category.name, props: { sx: { maxWidth: '100px' } } },
        { label: html, tooltip: html, props: { sx: { maxWidth: '200px' } } }
      ]
    };
  });

  return (
    <SectionTable
      section={remediations}
      headings={TERMINAL_REMEDIATION_HEADINGS}
      rows={rows}
      filterLabel='remediations'
      handleRowClick={handleRowClick}
      height={height}
      defaultLimit={25}
      page_id={page_id}
      test_id={test_id}
    />
  );
};

const Terminal = ({}) => {
  const isAuditPage = typeof window !== 'undefined' && window.location.pathname.includes('/audit');
  const { height } = useUiStore(({ editor }) => ({ height: editor.height }));
  const { selectedPage, selectedTest } = useProjectStore();
  const { audit, selectedCriterion } = useAuditStore();
  const { testsFilter, setTestsFilter, filter, setFilter, reset, setPageId, setTestId, hideTerminal } = useTerminalStore(state => ({
    testsFilter: state.tests.filter,
    setTestsFilter: state.tests.setFilter,
    filter: state.filter,
    setFilter: state.setFilter,
    reset: state.reset,
    setPageId: state.setPageId,
    setTestId: state.setTestId,
    hideTerminal: state.hideTerminal
  }));
  const { criteria } = useSystemStore();

  const { openSnackbar } = useSnackbarStore();

  const [isExportLoading, setIsExportLoading] = useState(false);

  useEffect(() => {
    if (selectedPage?.id) {
      setPageId(selectedPage.id);
    }
    if (selectedTest?.id) {
      setTestId(selectedTest.id);
    }
  }, [selectedPage, selectedTest]);

  const maxHeight = height * (TERMINAL_MAX_HEIGHT_PERCENTAGE / 100);
  const defaultHeight = height * (TERMINAL_DEFAULT_HEIGHT_PERCENTAGE / 100);

  const [tab, setTab] = useState(0);
  const [dimensions, setDimensions] = useState({ height: defaultHeight < TERMINAL_MIN_HEIGHT ? TERMINAL_MIN_HEIGHT : defaultHeight });

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const onResize = (dimensions) => {
    setDimensions({
      width: dimensions.width,
      height: dimensions.height > maxHeight ? maxHeight : dimensions.height < TERMINAL_MIN_HEIGHT ? TERMINAL_MIN_HEIGHT : dimensions.height
    });
  };

  const handleTestCaseFilterChange = (type, value) => {
    setTestsFilter({ ...filter, [type]: value });
    if (isAuditPage) {
      if (selectedCriterion.criteria !== null) {
        useTerminalStore.getState().tests.fetchData();
      }
    }
  };

  const handleFilterChange = (type, value) => {
    setFilter({ ...filter, [type]: value });
  };

  const handleExport = async () => {
    setIsExportLoading(true);
    const res = await window.api.environmentPage.generateReport(
      {
        environment_page_id: selectedPage.id,
        environment_test_id: selectedTest.id
      },
      { is_remediation_report: tab === 1 }
    );
    if (res.message) {
      if (res.success) {
        openSnackbar({ message: res.message, severity: 'success' });
      } else {
        openSnackbar({ message: res.message });
      }
    }
    setIsExportLoading(false);
  };

  useEffect(() => {
    return () => {
      reset();
      if (isAuditPage) {
        setFilter({});
      }
    };
  }, []);

  if (!isAuditPage && (!selectedPage || !selectedTest)) return;
  if (isAuditPage && (!audit || !selectedCriterion)) return;

  const TABS_DATA = !isAuditPage
    ? [
        {
          label: 'Test Cases',
          name: 'tests',
          component: <TestsTable page_id={selectedPage.id} test_id={selectedTest.id} height={dimensions.height} />
        },
        {
          label: 'Remediations',
          name: 'remediations',
          component: <RemediationsTable page_id={selectedPage.id} test_id={selectedTest.id} height={dimensions.height} />
        }
      ]
    : [
        {
          label: 'Related tests',
          name: 'relatedTests',
          component: <TestsTable page_id='' test_id={audit.environment_test_id} height={dimensions.height} isAuditTable={true} />
        }
      ];

  const filteredCriteria = filter.level ? criteria.filter(c => c.level === filter.level) : criteria;
  const criteriaOptions = filteredCriteria.map(c => ({ label: `${c.id} - ${c.name}`, value: c.id }));

  const filteredLevels = filter.criteria ? Array.from(new Set(criteria.filter(c => filter.criteria.includes(c.id)).map(c => c.level))) : [];
  const levelOptions
    = filteredLevels.length > 0 ? filteredLevels.map(l => ({ label: l, value: l })).sort((a, b) => a.label.localeCompare(b.label)) : TERMINAL_TEST_CASE_LEVEL_OPTIONS;

  if (hideTerminal) {
    return null;
  }

  return (
    <>
      <ResizableBlock
        height={defaultHeight}
        width={NaN}
        minHeight={TERMINAL_MIN_HEIGHT}
        maxConstraints={[2, maxHeight]}
        axis='y'
        resizeHandles={['n']}
        closeable
        onResize={onResize}
      >
        <div className={style.root}>
          <div className={style.header}>
            <Tabs value={tab} onChange={handleTabChange} aria-label='tabs' className={style.tabs}>
              {TABS_DATA.map((data, i) => (
                <Tab label={<Typography>{data.label}</Typography>} key={i} id={`tab-${data.name}`} aria-controls={`tabpanel-${data.name}`} className={style.tab} />
              ))}
            </Tabs>
            <div className={style.filters}>
              {tab === 0 && (
                <Select
                  options={TERMINAL_TEST_CASE_STATUS_OPTIONS}
                  value={testsFilter.status}
                  onChange={e => handleTestCaseFilterChange('status', e)}
                  className={style.formField}
                />
              )}
              {!isAuditPage && (
                <>
                  <Select
                    options={criteriaOptions}
                    multiple
                    value={filter.criteria}
                    onChange={e => handleFilterChange('criteria', e)}
                    className={style.formField}
                    placeHolder='Select criteria'
                    menuMaxHeight='400px'
                    chipClassName={style.chip}
                  />
                  <Select
                    placeHolder='Select level'
                    options={[{ label: 'All levels', value: '' }, ...levelOptions]}
                    value={levelOptions.length === 1 ? levelOptions[0].value : filter.level}
                    onChange={e => handleFilterChange('level', e)}
                    className={style.formField}
                  />
                  <Button className={style.exportBtn} variant='outlined' onClick={handleExport} disabled={isExportLoading}>
                    <Typography>Export</Typography>
                    <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={save} />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className={style.content}>
            {TABS_DATA.map((data, i) => (
              <div role='tabpanel' hidden={tab !== i} id={`tabpanel-${data.name}`} aria-labelledby={`tab-${data.name}`} key={i} style={{ display: tab === i ? 'block' : 'none' }}>
                {data.component}
              </div>
            ))}
          </div>
        </div>
      </ResizableBlock>
    </>
  );
};

export default Terminal;
