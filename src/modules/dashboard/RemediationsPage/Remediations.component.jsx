import { circlePlus, copy, edit, eye, trash } from '@/assets/icons';
import { REMEDIATION_HEADINGS } from '@/constants/remediation';
import { getArrayTruncatedLabel } from '@/electron/lib/utils';
import { DrawerFilter, DrawerRemediation } from '@/modules/core/Drawer';
import Icon from '@/modules/core/Icon';
import IconButton from '@/modules/core/IconButton';
import Search from '@/modules/core/Search';
import Table from '@/modules/core/Table';
import TablePagination from '@/modules/core/TablePagination';
import { useRemediationsStore, useSystemStore } from '@/stores';
import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import DeleteRemediation from './Dialogs/DeleteRemediation';
import RemediationForm from './Dialogs/RemediationForm';
import style from './Remediations.module.scss';

const prepareFilterItems = (criteria, categories, testCases) => {
  const items = [];

  const categoryData = {
    id: 'categories',
    heading: 'Category',
    options: []
  };

  for (const category of categories) {
    const option = {
      id: 'system_categories',
      label: category.name,
      value: category.id
    };
    categoryData.options.push(option);
  }
  items.push(categoryData);

  const criteriaData = {
    id: 'criteria',
    heading: 'Criterion',
    options: []
  };
  for (const criterion of criteria) {
    const option = {
      id: 'system_standard_criteria',
      label: `${criterion.id} ${criterion.name}`,
      value: criterion.id
    };
    criteriaData.options.push(option);
  }
  items.push(criteriaData);

  if (testCases.length > 0) {
    const testCaseData = {
      id: 'testCase',
      heading: 'Test case',
      options: []
    };
    for (const testCase of testCases) {
      const option = {
        id: 'test_cases',
        label: `${testCase.id} - ${testCase.name}`,
        value: testCase.id
      };
      testCaseData.options.push(option);
    }
    items.push(testCaseData);
  }
  return items;
};

const remediations = () => {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';

  const {
    remediations,
    setRemediations,
    selectedRemediations,
    setSelectedRemediations,
    addSelectedRemediation,
    removeSelectedRemediation,
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
  } = useRemediationsStore();

  const { criteria, categories } = useSystemStore();

  const tableRef = useRef(null);
  const firstRowRef = useRef(null);
  const inputRef = useRef();
  const filterBtnRef = useRef();

  const hasFilters = Object.keys(checkedFilters).length > 0;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedRemediationId, setSelectedRemediationId] = useState(null); // will be used later with dialogs
  const [testCases, setTestCases] = useState([]);
  const [isRemediationFormDialogOpen, setIsRemediationFormDialogOpen] = useState(false);
  const [isDeleteRemediationDialogOpen, setIsDeleteRemediationDialogOpen] = useState(false);
  const [duplicateRemediation, setDuplicateRemediation] = useState(false);
  const [isRemediationInfoDrawerOpen, setIsRemediationInfoDrawerOpen] = useState(false);

  useEffect(() => {
    const getTestCases = async () => {
      const testCasesRes = await window.api.testCase.find({ limit: false });
      const testCases = testCasesRes.result;
      setTestCases(testCases);
    };
    getTestCases();
  }, []);

  const getRemediations = async (filter, pagination, sort) => {
    try {
      const remediationsRes = await window.api.remediation.find({ ...filter, ...pagination, sort }, { detailed: true, count: true });
      const { result, meta } = remediationsRes;
      setRemediations(result);
      setMeta(meta);
    } catch (e) {
      console.log(e);
    }
  };

  const getSelectedRemediations = async () => {
    try {
      const RemediationsRes = await window.api.remediation.find({ is_selected: true, limit: false });
      const { result } = RemediationsRes;
      setSelectedRemediations(result);
    } catch (e) {
      console.log(e);
    }
  };

  const refreshRemediations = async () => {
    getRemediations(filter, pagination, sort);
    getSelectedRemediations();
  };

  useEffect(() => {
    getRemediations(filter, pagination, sort);
  }, [filter, pagination, sort]);

  useEffect(() => {
    handleResetFilters();
    getSelectedRemediations();
  }, []);

  useEffect(() => {
    if (openCreate) {
      openRemediationForm();
    }
  }, [openCreate]);

  const handleRowClick = async (row) => {
    if (selectedRemediations.find(t => t.id === row.id)) {
      removeSelectedRemediation(row.id);
      await window.api.remediation.update({ id: row.id, is_selected: false });
    } else {
      addSelectedRemediation(row);
      await window.api.remediation.update({ id: row.id, is_selected: true });
    }
  };

  const handleSelectAllClick = async () => {
    const remediationsByFilterRes = await window.api.remediation.find({ ...filter, limit: false }, { detailed: true });
    const remediationsByFilter = remediationsByFilterRes.result;

    const allSelected = remediationsByFilter.every(tc => tc.is_selected);

    if (allSelected) {
      // Unselect all filtered remediations
      const idsToUnselect = remediationsByFilter.map(tc => tc.id);
      await window.api.remediation.updateIsSelected({
        ids: idsToUnselect,
        is_selected: false
      });
      const removedSelectedRemediations = selectedRemediations.filter(st => !remediationsByFilter.some(ft => ft.id === st.id));
      setSelectedRemediations(removedSelectedRemediations);
    } else {
      // Select all filtered remediations
      const idsToSelect = remediationsByFilter.filter(tc => !tc.is_selected).map(tc => tc.id);
      if (idsToSelect.length > 0) {
        await window.api.remediation.updateIsSelected({
          ids: idsToSelect,
          is_selected: true
        });
      }
      const alreadySelectedIds = new Set(selectedRemediations.map(tc => tc.id));
      const newSelections = remediationsByFilter.filter(tc => !alreadySelectedIds.has(tc.id));
      setSelectedRemediations([...selectedRemediations, ...newSelections]);
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

  const closeRemediationDrawer = () => {
    setIsRemediationInfoDrawerOpen(false);
    setTimeout(() => {
      setSelectedRemediationId(null);
    }, 250);
  };

  const rows = remediations.map((remediation) => {
    const testCaseIds = remediation.test_cases.map(tc => tc.id);
    let criteria = remediation.criteria;
    if (sort.field === 'criteria' && sort.direction === 'desc') {
      criteria = remediation.criteria.sort((a, b) => b.id.localeCompare(a.id));
    }
    return {
      id: remediation.id,
      isSelected: remediation.is_selected,
      items: [
        { label: remediation.id },
        { label: remediation.name, tooltip: remediation.name, props: { component: 'th', sx: { maxWidth: '200px' } } },
        { label: remediation.category.name },
        {
          label: getArrayTruncatedLabel(
            criteria.map(c => `${c.id}: ${c.name}`),
            1
          ),
          tooltip: criteria.map(c => `${c.id}: ${c.name}`).join(', ')
        },
        { label: getArrayTruncatedLabel(testCaseIds), tooltip: testCaseIds.join(', ') }
      ]
    };
  });

  const actionItems = [
    {
      label: 'View remediation',
      icon: eye,
      onClick: (row) => {
        setSelectedRemediationId(row.id);
        setIsRemediationInfoDrawerOpen(true);
      }
    },
    {
      label: 'Edit remediation',
      icon: edit,
      isOptionRemoved: (row) => {
        return row.id.startsWith('USR');
      },
      onClick: (row) => {
        setSelectedRemediationId(row.id);
        setIsRemediationFormDialogOpen(true);
      }
    },
    {
      label: 'Duplicate remediation',
      icon: copy,
      onClick: (row) => {
        setSelectedRemediationId(row.id);
        setDuplicateRemediation(true);
        setIsRemediationFormDialogOpen(true);
      },
      divider: true
    },
    {
      label: 'Delete remediation',
      icon: trash,
      isDestroyItem: true,
      onClick: (row) => {
        setSelectedRemediationId(row.id);
        setIsDeleteRemediationDialogOpen(true);
      },
      isOptionRemoved: (row) => {
        return row.id.startsWith('USR');
      }
    }
  ];

  const openRemediationForm = () => {
    setIsRemediationFormDialogOpen(true);
  };

  const closeRemediationForm = () => {
    setIsRemediationFormDialogOpen(false);
    setTimeout(() => {
      setDuplicateRemediation(false);
      setSelectedRemediationId(null);
    }, 100);
  };

  return (
    <>
      <Box className={style.root}>
        <Box className={style.pageHeader}>
          <Box className={style.titleWrapper}>
            <Typography variant='h2' className={style.title}>
              Remediations
            </Typography>
          </Box>
          <Box className={classNames(style.actionWrapper, { [style.expanded]: isSearchOpen })}>
            <Box className={style.actionButtons}>
              <IconButton ref={filterBtnRef} Icon='filter' className={style.outlinedButton} onClick={() => setIsDrawerOpen(true)} badge={hasFilters} />
              <IconButton Icon='search' className={style.outlinedButton} onClick={handleSearchClick} />
              <Button className={style.actionButton} onClick={openRemediationForm}>
                <Typography>Add remediation</Typography>
                <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={circlePlus} />
              </Button>
              <RemediationForm
                open={isRemediationFormDialogOpen}
                onClose={closeRemediationForm}
                onRemediationAdded={refreshRemediations}
                remediationId={selectedRemediationId}
                duplicateRemediation={duplicateRemediation}
              >
              </RemediationForm>
            </Box>
            <Box className={style.searchWrapper}>
              <Search onSearch={handleSearch} value={inputValue} setValue={setInputValue} debounceVars={[filter]} ref={inputRef} tabIndex={isSearchOpen ? 0 : -1} />
              <IconButton Icon='close' onClick={handleSearchClose} tabIndex={isSearchOpen ? 0 : -1} />
            </Box>
          </Box>
        </Box>
        <Typography className={style.infoText}>
          {selectedRemediations.length} out of {meta.total_count} remediations selected to be used in your projects
        </Typography>
        <Box className={style.tableWrapper} sx={{ '--top-margin': '238px' }}>
          <Table
            headings={REMEDIATION_HEADINGS}
            rows={rows}
            filter={filter}
            size='small'
            ariaLabel='remediations'
            onClick={handleRowClick}
            selectable
            selected={selectedRemediations.map(t => t.id)}
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
            filterLabel='remediations'
            tableRef={tableRef}
            firstRowRef={firstRowRef}
          />
        </Box>
        <DrawerFilter
          isOpen={isDrawerOpen}
          onClose={onFilterClose}
          items={prepareFilterItems(criteria, categories, testCases)}
          onSubmit={onFilterSubmit}
          checkedFilters={checkedFilters}
          setCheckedFilters={setCheckedFilters}
          openFilterItems={openFilterItems}
          setOpenFilterItems={setOpenFilterItems}
        />
      </Box>
      <DeleteRemediation
        open={isDeleteRemediationDialogOpen}
        onClose={() => setIsDeleteRemediationDialogOpen(false)}
        remediationId={selectedRemediationId}
        onDeleteSuccess={refreshRemediations}
      />
      <DrawerRemediation remediation={remediations.find(r => r.id === selectedRemediationId)} isOpen={isRemediationInfoDrawerOpen} onClose={closeRemediationDrawer} />
    </>
  );
};

export default remediations;
