import { SETTINGS_HEADINGS } from '@/constants/settings';
import Table from '@/modules/core/Table';
import TablePagination from '@/modules/core/TablePagination';
import DeleteEnvironment from '@/modules/dashboard/SettingsPage/Environments/Dialogs/DeleteEnvrionment';
import { useEnvironmentsStore } from '@/stores';
import { circlePlus, trash, sliders } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../Settings.module.scss';
import EnvironmentsForm from './Dialogs/EnvironmentsForm/EnvironmentsForm.component';

export default function Environments() {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';

  const {
    environments,
    setEnvironments,
    selectedEnvironments,
    setSelectedEnvironments,
    addSelectedEnvironment,
    removeSelectedEnvironment,
    meta,
    setMeta,
    pagination,
    setPagination
  } = useEnvironmentsStore();

  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(null);
  const [isEnvironmentFormOpen, setEnvironmentFormOpen] = useState(false);
  const [isDeleteEnvironmentDialogOpen, setIsDeleteEnvironmentDialogOpen] = useState(false);

  const actionItems = [
    {
      label: 'Edit environment',
      icon: sliders,
      onClick: (row) => {
        setSelectedEnvironmentId(row.id);
        setEnvironmentFormOpen(true);
      },
      divider: true
    },
    {
      label: 'Delete environment',
      icon: trash,
      isDestroyItem: true,
      onClick: (row) => {
        setSelectedEnvironmentId(row.id);
        setIsDeleteEnvironmentDialogOpen(true);
      }
    }
  ];

  const rows = environments.map((environment) => {
    return {
      id: environment.id,
      isSystem: environment.is_system,
      isSelected: environment.is_selected,
      items: [
        { label: environment.name },
        { label: environment.is_system ? 'Standard' : 'Custom' }
      ],
      disableActions: environment.is_system
    };
  });

  const getEnvironments = async (pagination) => {
    setSelectedEnvironmentId(null);
    try {
      const EnvironmentsRes = await window.api.systemEnvironment.find({ ...pagination }, { detailed: true, count: true });
      const { result, meta } = EnvironmentsRes;
      setEnvironments(result);
      setMeta(meta);
    } catch (e) {
      console.log(e);
    }
  };

  const getSelectedEnvironments = async () => {
    try {
      const EnvironmentsRes = await window.api.systemEnvironment.find({ is_selected: true, limit: false });
      const { result } = EnvironmentsRes;
      setSelectedEnvironments(result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getEnvironments(pagination);
  }, [pagination]);

  useEffect(() => {
    getSelectedEnvironments();
  }, []);

  useEffect(() => {
    if (openCreate) {
      openEnvironmentForm();
    }
  }, [openCreate]);

  const handleRowClick = async (row) => {
    if (selectedEnvironments.find(t => t.id === row.id)) {
      removeSelectedEnvironment(row.id);
      await window.api.systemEnvironment.update({ id: row.id, is_selected: false });
    } else {
      addSelectedEnvironment(row);
      await window.api.systemEnvironment.update({ id: row.id, is_selected: true });
    }
  };

  const handleSelectAllClick = async () => {
    const environmentsByFilterRes = await window.api.systemEnvironment.find({ limit: false }, { detailed: true });
    const environmentsByFilter = environmentsByFilterRes.result;

    const allSelected = environmentsByFilter.every(tc => tc.is_selected);

    if (allSelected) {
      // Unselect all filtered environments
      const idsToUnselect = environmentsByFilter.map(tc => tc.id);
      await window.api.systemEnvironment.updateIsSelected({
        ids: idsToUnselect,
        is_selected: false
      });
      const removedSelectedEnvironments = selectedEnvironments.filter(st => !environmentsByFilter.some(ft => ft.id === st.id));
      setSelectedEnvironments(removedSelectedEnvironments);
    } else {
      // Select all filtered environments
      const idsToSelect = environmentsByFilter.filter(tc => !tc.is_selected).map(tc => tc.id);
      if (idsToSelect.length > 0) {
        await window.api.systemEnvironment.updateIsSelected({
          ids: idsToSelect,
          is_selected: true
        });
      }
      const alreadySelectedIds = new Set(selectedEnvironments.map(tc => tc.id));
      const newSelections = environmentsByFilter.filter(tc => !alreadySelectedIds.has(tc.id));
      setSelectedEnvironments([...selectedEnvironments, ...newSelections]);
    }
  };

  const openEnvironmentForm = () => {
    setEnvironmentFormOpen(true);
  };

  const closeEnvironmentForm = () => {
    setEnvironmentFormOpen(false);
    setTimeout(() => {
      setSelectedEnvironmentId(null);
    }, 100);
  };

  const handleEnvironmentAdd = () => {
    getEnvironments(pagination);
    getSelectedEnvironments();
    setSelectedEnvironmentId(null);
  };

  return (
    <>
      <Box className={styles.tabHeader}>
        <Typography variant='h3'>Environments</Typography>
        <div className={styles.actionButton}>
          <Button onClick={openEnvironmentForm}>
            <Typography>Add environment</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
          <EnvironmentsForm open={isEnvironmentFormOpen} onClose={closeEnvironmentForm} onEnvironmentAdded={handleEnvironmentAdd} environmentId={selectedEnvironmentId} />
        </div>
      </Box>
      <Box className={classNames(styles.settingsList, styles.environmentsList)}>
        <Box className={styles.tableWrapper} sx={{ '--top-margin': '238px' }}>
          <Table
            headings={SETTINGS_HEADINGS}
            rows={rows}
            size='small'
            ariaLabel='environments'
            onClick={handleRowClick}
            selectable
            selected={selectedEnvironments.map(e => e.id)}
            onSelectAllClick={handleSelectAllClick}
            totalCount={meta.total_count}
            className={styles.table}
            actionItems={actionItems}
          />
          <TablePagination
            meta={meta}
            onChange={setPagination}
            className={styles.tablePagination}
          />
        </Box>
      </Box>
      {isDeleteEnvironmentDialogOpen && (
        <DeleteEnvironment open={isDeleteEnvironmentDialogOpen} onClose={() => setIsDeleteEnvironmentDialogOpen(false)} environmentId={selectedEnvironmentId} onDeleteSuccess={getEnvironments} />
      )}
    </>
  );
}
