import { activity, circlePlus, clipboard, copy, edit, eye, toolbox, trash } from '@/assets/icons';
import { TEST_CASE_HEADINGS } from '@/constants/testCase';
import { getArrayTruncatedLabel } from '@/electron/lib/utils';
import { DrawerFilter } from '@/modules/core/Drawer';
import Icon from '@/modules/core/Icon';
import IconButton from '@/modules/core/IconButton';
import Search from '@/modules/core/Search';
import Table from '@/modules/core/Table';
import TablePagination from '@/modules/core/TablePagination';
import { useSystemStore, useTestCasesStore } from '@/stores';
import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import DrawerTestCase from '../../core/Drawer/DrawerTestCase';
import DeleteTestCase from './dialogs/DeleteTestCase';
import ManageRemediations from './dialogs/ManageRemediations';
import TestCaseForm from './dialogs/TestCaseForm';
import style from './TestCases.module.scss';

const prepareFilterItems = (standards) => {
  const items = [
    {
      id: 'type',
      heading: 'Type',
      onlyOneSelectable: true,
      options: [
        {
          id: 'type',
          label: 'Manual',
          value: 'MANUAL'
        },
        {
          id: 'type',
          label: 'Automatic',
          value: 'AUTOMATIC'
        }
      ]
    }
  ];

  const standardData = {
    id: 'standard',
    heading: 'Criterion',
    options: []
  };
  for (const standard of standards) {
    const option = {
      id: 'system_standards',
      label: standard.name,
      value: standard.id,
      children: standard.principles.map(p => ({
        id: 'system_standard_principles',
        label: `${p.id}. ${p.name}`,
        value: p.id,
        children: p.guidelines.map(g => ({
          id: 'system_standard_guidelines',
          label: `${g.id}. ${g.name}`,
          value: g.id,
          children: g.criteria.map(c => ({
            id: 'system_standard_criteria',
            label: `${c.id}. ${c.name}`,
            value: c.id
          }))
        }))
      }))
    };
    standardData.options.push(option);
  }
  items.push(standardData);
  return items;
};

const TestCases = () => {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';

  const {
    testCases,
    setTestCases,
    selectedTestCases,
    setSelectedTestCases,
    addSelectedTestCase,
    removeSelectedTestCase,
    meta,
    setMeta,
    sort,
    setSort,
    filter,
    setFilter,
    checkedFilters,
    setCheckedFilters,
    pagination,
    setPagination,
    openFilterItems,
    setOpenFilterItems
  } = useTestCasesStore();

  const { standards } = useSystemStore();

  const tableRef = useRef(null);
  const firstRowRef = useRef(null);
  const inputRef = useRef();
  const filterBtnRef = useRef();

  const hasFilters = Object.keys(checkedFilters).length > 0;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isDeleteTestCaseDialogOpen, setIsDeleteTestCaseDialogOpen] = useState(false);
  const [isManageRemediationsDialogOpen, setIsManageRemediationsDialogOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [isTestCaseFormDialogOpen, setTestCaseFormDialogOpen] = useState(false);
  const [duplicateTest, setDuplicateTest] = useState(false);
  const [isTestCaseInfoDrawerOpen, setIsTestCaseInfoDrawerOpen] = useState(false);

  const getTestCases = async (filter, pagination, sort) => {
    try {
      const testCasesRes = await window.api.testCase.find({ ...filter, ...pagination, sort }, { detailed: true, count: true });
      const { result, meta } = testCasesRes;
      setTestCases(result);
      setMeta(meta);
    } catch (e) {
      console.log(e);
    }
  };

  const getSelectedTestCases = async () => {
    try {
      const testCasesRes = await window.api.testCase.find({ is_selected: true, limit: false });
      const { result } = testCasesRes;
      setSelectedTestCases(result);
    } catch (e) {
      console.log(e);
    }
  };

  const refreshTestCases = async () => {
    await getTestCases(filter, pagination, sort);
    await getSelectedTestCases();
  };

  useEffect(() => {
    getTestCases(filter, pagination, sort);
  }, [filter, pagination, sort]);

  useEffect(() => {
    handleResetFilters();
    getSelectedTestCases();
  }, []);

  useEffect(() => {
    if (openCreate) {
      openTestCaseForm();
    }
  }, [openCreate]);

  const handleRowClick = async (row) => {
    if (selectedTestCases.find(t => t.id === row.id)) {
      removeSelectedTestCase(row.id);
      await window.api.testCase.update({ id: row.id, is_selected: false });
    } else {
      addSelectedTestCase(row);
      await window.api.testCase.update({ id: row.id, is_selected: true });
    }
  };

  const handleSelectAllClick = async () => {
    const testCasesByFilterRes = await window.api.testCase.find({ ...filter, limit: false });
    const testCasesByFilter = testCasesByFilterRes.result;

    const allSelected = testCasesByFilter.every(tc => tc.is_selected);

    if (allSelected) {
      // Unselect all filtered test cases
      const idsToUnselect = testCasesByFilter.map(tc => tc.id);
      await window.api.testCase.updateIsSelected({
        ids: idsToUnselect,
        is_selected: false
      });
      const removedSelectedTestCases = selectedTestCases.filter(st => !testCasesByFilter.some(ft => ft.id === st.id));
      setSelectedTestCases(removedSelectedTestCases);
    } else {
      // Select all filtered test cases
      const idsToSelect = testCasesByFilter.filter(tc => !tc.is_selected).map(tc => tc.id);
      if (idsToSelect.length > 0) {
        await window.api.testCase.updateIsSelected({
          ids: idsToSelect,
          is_selected: true
        });
      }
      const alreadySelectedIds = new Set(selectedTestCases.map(tc => tc.id));
      const newSelections = testCasesByFilter.filter(tc => !alreadySelectedIds.has(tc.id));
      setSelectedTestCases([...selectedTestCases, ...newSelections]);
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    inputRef.current.focus({ preventScroll: true });
  };
  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setInputValue('');
    handleSearch('');
  };
  const handleSearch = (value) => {
    if (value) {
      setFilter({ ...filter, search: value });
      setPagination({ ...pagination, page: 1 });
    } else {
      setFilter({ ...filter, search: undefined });
    }
  };
  const handleSort = (field, direction) => {
    setSort({ field, direction });
  };
  const handleResetFilters = () => {
    setCheckedFilters({});
    setFilter({});
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  const onFilterSubmit = (newFilters) => {
    setIsDrawerOpen(false);
    setPagination(prev => ({ ...prev, page: 0 }));
    setFilter(newFilters);
    setTimeout(() => {
      if (filterBtnRef.current) {
        filterBtnRef.current.focus();
      }
    }, 0);
  };

  const onFilterClose = () => {
    setIsDrawerOpen(false);
    if (filterBtnRef.current) {
      filterBtnRef.current.focus();
    }
  };

  const rows = testCases.map((testCase) => {
    return {
      id: testCase.id,
      isSelected: testCase.is_selected,
      items: [
        { label: testCase.id },
        { label: testCase.name, props: { component: 'th', sx: { maxWidth: '200px' } } },
        {
          label: testCase.type === 'MANUAL' ? <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={clipboard} /> : <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={activity} />,
          tooltip: testCase.type === 'MANUAL' ? 'Manual' : 'Automatic',
          props: { sx: { width: '30px' } }
        },
        {
          label: getArrayTruncatedLabel(testCase.criteria.map(c => `${testCase.standard.name} ${c.id}: ${c.name}`)),
          tooltip: testCase.description,
          props: { sx: { maxWidth: '200px' } }
        }
      ]
    };
  });

  const actionItems = [
    {
      label: 'View test case',
      icon: eye,
      onClick: (row) => {
        setSelectedTestCaseId(row.id);
        setIsTestCaseInfoDrawerOpen(true);
      }
    },
    {
      label: 'Edit test case',
      icon: edit,
      onClick: (row) => {
        setSelectedTestCaseId(row.id);
        setTestCaseFormDialogOpen(true);
      },
      isOptionRemoved: (row) => {
        return row.id.startsWith('USR');
      }
    },
    {
      label: 'Duplicate test case',
      icon: copy,
      onClick: (row) => {
        setSelectedTestCaseId(row.id);
        setDuplicateTest(true);
        setTestCaseFormDialogOpen(true);
      }
    },
    {
      label: 'Manage Remediations',
      icon: toolbox,
      onClick: (row) => {
        setSelectedTestCaseId(row.id);
        setIsManageRemediationsDialogOpen(true);
      },
      divider: true,
      isOptionRemoved: (row) => {
        return row.id.startsWith('USR');
      }
    },
    {
      label: 'Delete test case',
      icon: trash,
      isDestroyItem: true,
      onClick: (row) => {
        setSelectedTestCaseId(row.id);
        setIsDeleteTestCaseDialogOpen(true);
      },
      isOptionRemoved: (row) => {
        return row.id.startsWith('USR');
      }
    }
  ];

  const openTestCaseForm = () => {
    setTestCaseFormDialogOpen(true);
  };

  const closeTestCaseForm = () => {
    setTestCaseFormDialogOpen(false);
    setTimeout(() => {
      setDuplicateTest(false);
      setSelectedTestCaseId(null);
    }, 10);
  };

  const closeManageRemediationForm = () => {
    setIsManageRemediationsDialogOpen(false);
    setSelectedTestCaseId(null);
  };

  const closeDeleteTestCaseForm = () => {
    setIsDeleteTestCaseDialogOpen(false);
    setSelectedTestCaseId(null);
  };

  const handleTestCaseAdd = async () => {
    await refreshTestCases();
  };

  const closeTestInfoDrawer = () => {
    setIsTestCaseInfoDrawerOpen(false);
    setTimeout(() => {
      setSelectedTestCaseId(null);
    }, 250);
  };

  const selectedTestCase = testCases.find(t => t.id === selectedTestCaseId) || null;

  return (
    <>
      <Box className={style.root}>
        <Box className={style.pageHeader}>
          <Box className={style.titleWrapper}>
            <Typography variant='h2' className={style.title}>
              Test Cases
            </Typography>
          </Box>
          <Box className={classNames(style.actionWrapper, { [style.expanded]: isSearchOpen })}>
            <Box className={style.actionButtons}>
              <IconButton
                aria-label='Filter test cases'
                Icon='filter'
                className={style.outlinedButton}
                onClick={() => setIsDrawerOpen(true)}
                badge={hasFilters}
                ref={filterBtnRef}
              />
              <IconButton aria-label='Search test cases' Icon='search' className={style.outlinedButton} onClick={handleSearchClick} />
              <Button className={style.actionButton} onClick={openTestCaseForm}>
                <Typography>Add test case</Typography>
                <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={circlePlus} />
              </Button>
              <TestCaseForm
                open={isTestCaseFormDialogOpen}
                onClose={closeTestCaseForm}
                onTestCaseAdded={handleTestCaseAdd}
                testCaseId={selectedTestCaseId}
                duplicateTest={duplicateTest}
              />
            </Box>
            <Box className={style.searchWrapper}>
              <Search onSearch={handleSearch} value={inputValue} setValue={setInputValue} debounceVars={[filter]} ref={inputRef} tabIndex={isSearchOpen ? 0 : -1} />
              <IconButton Icon='close' onClick={handleSearchClose} tabIndex={isSearchOpen ? 0 : -1} />
            </Box>
          </Box>
        </Box>
        <Typography className={style.infoText}>
          {selectedTestCases.length} out of {meta.total_count} test cases selected to be used in your projects
        </Typography>
        <Box className={style.tableWrapper} sx={{ '--top-margin': '238px' }}>
          <Table
            headings={TEST_CASE_HEADINGS}
            rows={rows}
            filter={filter}
            size='small'
            ariaLabel='test cases'
            onClick={handleRowClick}
            selectable
            selected={selectedTestCases.map(t => t.id)}
            onSelectAllClick={handleSelectAllClick}
            totalCount={meta.total_count}
            sortable
            onSort={handleSort}
            className={style.table}
            actionItems={actionItems}
            ref={tableRef}
            firstRowRef={firstRowRef}
          />
          <TablePagination
            meta={meta}
            filter={pagination}
            onChange={setPagination}
            onReset={handleResetFilters}
            className={style.tablePagination}
            showFilterInfo
            hasFilters={hasFilters}
            onFilterReset={handleResetFilters}
            filterLabel='test cases'
            tableRef={tableRef}
            firstRowRef={firstRowRef}
          />
        </Box>
        <DrawerFilter
          isOpen={isDrawerOpen}
          onClose={onFilterClose}
          items={prepareFilterItems(standards)}
          onSubmit={onFilterSubmit}
          checkedFilters={checkedFilters}
          setCheckedFilters={setCheckedFilters}
          openFilterItems={openFilterItems}
          setOpenFilterItems={setOpenFilterItems}
        />
      </Box>
      <ManageRemediations open={isManageRemediationsDialogOpen} onClose={closeManageRemediationForm} testCaseId={selectedTestCaseId} />
      <DeleteTestCase open={isDeleteTestCaseDialogOpen} onClose={closeDeleteTestCaseForm} testCaseId={selectedTestCaseId} onDeleteSuccess={refreshTestCases} />
      <DrawerTestCase isOpen={isTestCaseInfoDrawerOpen} onClose={closeTestInfoDrawer} testCase={selectedTestCase} />
    </>
  );
};
export default TestCases;
