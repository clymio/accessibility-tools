import { SETTINGS_HEADINGS } from '@/constants/settings';
import Table from '@/modules/core/Table';
import TablePagination from '@/modules/core/TablePagination';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import { useRemediationCategoryStore } from '@/stores';
import { circlePlus, sliders, trash } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DeleteRemediationCategory from './Dialogs/DeleteRemediationCategory';
import RemediationCategoryForm from './Dialogs/RemediationCategoryForm';

export default function RemediationCategories() {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';

  const { categories, setCategories, selectedCategories, setSelectedCategories, addSelectedCategory, removeSelectedCategory, meta, setMeta, pagination, setPagination }
    = useRemediationCategoryStore();

  const [selectedRemediationCategoryId, setSelectedRemediationCategoryId] = useState(null);
  const [isRemediationCategoryFormOpen, setRemediationCategoryFormOpen] = useState(false);
  const [isDeleteRemediationCategoryDialogOpen, setIsDeleteRemediationCategoryDialogOpen] = useState(false);

  const actionItems = [
    {
      label: 'Edit category',
      icon: sliders,
      onClick: (row) => {
        setSelectedRemediationCategoryId(row.id);
        setRemediationCategoryFormOpen(true);
      },
      divider: true
    },
    {
      label: 'Delete category',
      icon: trash,
      isDestroyItem: true,
      onClick: (row) => {
        setSelectedRemediationCategoryId(row.id);
        setIsDeleteRemediationCategoryDialogOpen(true);
      }
    }
  ];

  const moveRow = (fromIndex, toIndex) => {
    const updated = [...categories];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCategories(updated);
  };

  const handleDrop = async () => {
    const newIds = categories.map(category => category.id);
    await window.api.systemCategory.updatePriority({ ids: newIds });
  };

  const rows = categories.map((category, index) => {
    return {
      id: category.id,
      isSystem: category.is_system,
      isSelected: category.is_selected,
      items: [{ label: category.name }, { label: category.is_system ? 'Standard' : 'Custom' }],
      disableActions: category.is_system
    };
  });

  const getCategories = async (pagination) => {
    setSelectedRemediationCategoryId(null);
    try {
      const CategoriesRes = await window.api.systemCategory.find({ ...pagination }, { detailed: true, count: true });
      const { result, meta } = CategoriesRes;
      setCategories(result);
      setMeta(meta);
    } catch (e) {
      console.log(e);
    }
  };

  const getSelectedCategories = async () => {
    try {
      const CategoriesRes = await window.api.systemCategory.find({ limit: false, is_selected: true });
      const { result } = CategoriesRes;
      setSelectedCategories(result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCategories(pagination);
  }, [pagination]);

  useEffect(() => {
    getSelectedCategories();
  }, []);

  useEffect(() => {
    if (openCreate) {
      openRemediationCategoryForm();
    }
  }, [openCreate]);

  const handleRowClick = async (row) => {
    if (selectedCategories.find(t => t.id === row.id)) {
      removeSelectedCategory(row.id);
      await window.api.systemCategory.update({ id: row.id, is_selected: false });
    } else {
      addSelectedCategory(row);
      await window.api.systemCategory.update({ id: row.id, is_selected: true });
    }
  };

  const handleSelectAllClick = async () => {
    const categoriesByFilterRes = await window.api.systemCategory.find({ limit: false }, { detailed: true });
    const categoriesByFilter = categoriesByFilterRes.result;

    const allSelected = categoriesByFilter.every(tc => tc.is_selected);

    if (allSelected) {
      // Unselect all filtered categories
      const idsToUnselect = categoriesByFilter.map(tc => tc.id);
      await window.api.systemCategory.updateIsSelected({
        ids: idsToUnselect,
        is_selected: false
      });
      const removedSelectedCategories = selectedCategories.filter(st => !categoriesByFilter.some(ft => ft.id === st.id));
      setSelectedCategories(removedSelectedCategories);
    } else {
      // Select all filtered categories
      const idsToSelect = categoriesByFilter.filter(tc => !tc.is_selected).map(tc => tc.id);
      if (idsToSelect.length > 0) {
        await window.api.systemCategory.updateIsSelected({
          ids: idsToSelect,
          is_selected: true
        });
      }
      const alreadySelectedIds = new Set(selectedCategories.map(tc => tc.id));
      const newSelections = categoriesByFilter.filter(tc => !alreadySelectedIds.has(tc.id));
      setSelectedCategories([...selectedCategories, ...newSelections]);
    }
  };

  const openRemediationCategoryForm = () => {
    setRemediationCategoryFormOpen(true);
  };

  const closeRemediationCategoryForm = () => {
    setRemediationCategoryFormOpen(false);
    setTimeout(() => {
      setSelectedRemediationCategoryId(null);
    }, 100);
  };

  const handleRemediationCategoryAdd = () => {
    getCategories();
    getSelectedCategories();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box className={styles.tabHeader}>
        <Typography variant='h3'>Remediation categories</Typography>
        <div className={styles.actionButton}>
          <Button onClick={openRemediationCategoryForm}>
            <Typography>Add category</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
          <RemediationCategoryForm
            open={isRemediationCategoryFormOpen}
            onClose={closeRemediationCategoryForm}
            onRemediationCategoryAdded={handleRemediationCategoryAdd}
            remediationCategoryId={selectedRemediationCategoryId}
          />
        </div>
      </Box>
      <Box className={classNames(styles.settingsList, styles.categoriesList)}>
        <Box className={styles.tableWrapper} sx={{ '--top-margin': '238px' }}>
          <Table
            headings={SETTINGS_HEADINGS}
            rows={rows}
            size='small'
            ariaLabel='Remediation categories'
            onClick={handleRowClick}
            selectable
            selected={selectedCategories.map(r => r.id)}
            onSelectAllClick={handleSelectAllClick}
            totalCount={meta.total_count}
            className={styles.table}
            actionItems={actionItems}
            draggable
            moveRow={moveRow}
            onDrop={handleDrop}
          />
          <TablePagination meta={meta} onChange={setPagination} className={styles.tablePagination} />
        </Box>
      </Box>
      {isDeleteRemediationCategoryDialogOpen && (
        <DeleteRemediationCategory
          open={isDeleteRemediationCategoryDialogOpen}
          onClose={() => setIsDeleteRemediationCategoryDialogOpen(false)}
          remediationCategoryId={selectedRemediationCategoryId}
          onDeleteSuccess={getCategories}
        />
      )}
    </DndProvider>
  );
}
