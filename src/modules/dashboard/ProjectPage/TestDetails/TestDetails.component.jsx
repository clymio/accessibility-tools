import { activity, clipboard, xIcon } from '@/assets/icons';
import { TERMINAL_SECTIONS, TERMINAL_TEST_DETAIL_STATUS_OPTIONS } from '@/constants/terminal';
import Chip from '@/modules/core/Chip';
import Icon from '@/modules/core/Icon';
import Select from '@/modules/core/Select';
import TestDetailsTab from '@/modules/dashboard/ProjectPage/TestDetails/DetailsTab/DetailsTab.component';
import NotesTab from '@/modules/dashboard/ProjectPage/TestDetails/NotesTab/NotesTab.component';
import PagesTab from '@/modules/dashboard/ProjectPage/TestDetails/PagesTab/PagesTab.component';
import RemediationsTab from '@/modules/dashboard/ProjectPage/TestDetails/RemediationsTab/RemediationsTab.component';
import style from '@/modules/dashboard/ProjectPage/TestDetails/TestDetails.module.scss';
import { useProjectStore, useTerminalStore, useUiStore } from '@/stores';
import { useTestDetailsStore } from '@/stores/useTestDetailsStore';
import { Box, IconButton, Tab, Tabs, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

const TestDetails = () => {
  const { status, setFormSaved, setStatus, setNotes, setRemediation, setRemediationOptions, setCurrentTargetNode, handleStatusChange } = useTestDetailsStore();
  const { getTestStats } = useProjectStore();
  const { clickedTargetContext } = useTerminalStore();
  const { theme, closeRightDrawer, rightDrawerSettings } = useUiStore();

  const statusSelectPalette = theme.palette.statusSelect;
  const statusPalette = status === 'FAIL' ? statusSelectPalette.fail : status === 'PASS' ? statusSelectPalette.pass : status === 'MANUAL' ? statusSelectPalette.warning : statusSelectPalette.disabled;

  const [editRemediation, setEditRemediation] = useState(false);
  const [editNotes, setEditNotes] = useState(false);

  const [tab, setTab] = useState(0);

  const currentTargetNode = clickedTargetContext.curr;
  const testCase = currentTargetNode?.test.test_case;
  const remediation = currentTargetNode?.remediation;
  const section = clickedTargetContext.section;
  const isRemediationDrawer = clickedTargetContext.section === TERMINAL_SECTIONS.REMEDIATIONS;
  const availableTabs = [];

  const handleTabChange = (newTab) => {
    if (newTab >= 0 && newTab < availableTabs.length) {
      setTab(newTab);
    }
  };

  const handleFormSave = async () => {
    setTab(clickedTargetContext.section === TERMINAL_SECTIONS.REMEDIATIONS ? 0 : 1);
  };

  const onStatusChange = async (value) => {
    await handleStatusChange(value);
    await getTestStats(currentTargetNode.test.environment_test_id);
  };

  useEffect(() => {
    if (!currentTargetNode || !testCase) return;

    setTab(0);
    setStatus(currentTargetNode.status || '');
    setNotes(currentTargetNode.notes || '');
    setEditNotes(false);
    setEditRemediation(false);
    const options = testCase.remediations.map(item => ({ value: item.id, label: item.id + ' | ' + item.name }));
    setRemediationOptions(options);

    const hasSavedData = !!currentTargetNode?.notes?.trim() || !!currentTargetNode?.remediation;
    setFormSaved(hasSavedData);

    if (currentTargetNode.remediation) {
      setRemediation(currentTargetNode.remediation.id);
    } else if (options.length > 0) {
      setRemediation(options[0].value);
    }
    setCurrentTargetNode(currentTargetNode);
  }, [currentTargetNode, testCase]);

  useEffect(() => {
    if (tab >= availableTabs.length) {
      setTab(Math.max(0, availableTabs.length - 1));
    }
  }, [availableTabs.length]);

  const TABS = {
    DETAILS: {
      tab: <Tab key='details' label='Test case details' />,
      content: <TestDetailsTab onFormSubmit={handleFormSave} />
    },
    REMEDIATIONS: {
      tab: <Tab key='remediations' label='Remediations' />,
      content: <RemediationsTab editRemediation={editRemediation} setEditRemediation={setEditRemediation} />
    },
    PAGES: {
      tab: <Tab key='pages' label='Pages' />,
      content: <PagesTab />
    },
    NOTES: {
      tab: <Tab key='notes' label='Notes' />,
      content: <NotesTab editNotes={editNotes} setEditNotes={setEditNotes} />
    }
  };

  if (section && section === TERMINAL_SECTIONS.REMEDIATIONS) {
    availableTabs.push(TABS.REMEDIATIONS, TABS.DETAILS, TABS.PAGES, TABS.NOTES);
  } else {
    if (status === 'INCOMPLETE' || status === 'FAIL') {
      availableTabs.push(TABS.DETAILS, TABS.REMEDIATIONS, TABS.PAGES, TABS.NOTES);
    } else {
      availableTabs.push(TABS.DETAILS, TABS.PAGES);
    }
  }

  if (!currentTargetNode || !testCase) return null;

  return (
    <Box className={classNames(style.root, { [style.narrow]: rightDrawerSettings.isNarrow })}>
      <Box className={style.top}>
        <Box className={style.header}>
          <Box className={style.info}>
            <Typography variant='h2' className={style.id}>
              {!isRemediationDrawer && <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={testCase.type === 'MANUAL' ? clipboard : activity} />}
              {isRemediationDrawer ? remediation.id : testCase.id}
              {currentTargetNode.landmark && <Chip type='info' label={currentTargetNode.landmark.name} />}
            </Typography>
            <Box className={style.type}>
              {!isRemediationDrawer && (
                <Select
                  className={style.typeSelect}
                  sx={{
                    color: statusPalette.color,
                    '& .MuiSelect-select': { border: 'none !important', color: 'inherit', background: `${statusPalette.background} !important` },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none !important' }
                  }}
                  options={TERMINAL_TEST_DETAIL_STATUS_OPTIONS}
                  value={status}
                  onChange={onStatusChange}
                  menuClassName={style.selectMenu}
                />
              )}
              <IconButton className={style.closeButton} onClick={closeRightDrawer}>
                <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={xIcon} />
              </IconButton>
            </Box>
          </Box>
          <Box className={style.name}>
            <Typography>{isRemediationDrawer ? remediation.name : testCase.name}</Typography>
          </Box>
          {currentTargetNode.selector_used && (
            <Box className={style.selectorUsed}>
              <Typography>Selector Type:</Typography>
              <Chip className={style.selectorChip} label={<Typography>{currentTargetNode.selector_used}</Typography>} />
            </Box>
          )}
        </Box>
        <Box className={style.tabsWrapper}>
          <Box className={style.tabs}>
            <Tabs value={Math.min(tab, availableTabs.length - 1)} onChange={(_, i) => handleTabChange(i)} variant='scrollable' scrollButtons={false}>
              {availableTabs.map(item => item.tab)}
            </Tabs>
          </Box>
        </Box>

        {availableTabs[tab]?.content}
      </Box>
    </Box>
  );
};

export default TestDetails;
