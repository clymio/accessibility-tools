import { activity, clipboard, xIcon } from '@/assets/icons';
import { TERMINAL_SECTIONS, TERMINAL_TEST_DETAIL_STATUS_OPTIONS } from '@/constants/terminal';
import Icon from '@/modules/core/Icon';
import Select from '@/modules/core/Select';
import TestDetailsTab from '@/modules/dashboard/ProjectPage/TestDetails/DetailsTab/DetailsTab.component';
import NotesTab from '@/modules/dashboard/ProjectPage/TestDetails/NotesTab/NotesTab.component';
import RemediationsTab from '@/modules/dashboard/ProjectPage/TestDetails/RemediationsTab/RemediationsTab.component';
import style from '@/modules/dashboard/ProjectPage/TestDetails/TestDetails.module.scss';
import { useProjectStore, useTerminalStore, useUiStore } from '@/stores';
import { useTestDetailsStore } from '@/stores/useTestDetailsStore';
import { Box, Chip, IconButton, Tab, Tabs, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

const TestDetails = () => {
  const { status, setFormSaved, setStatus, setNotes, setRemediation, setRemediationOptions, setCurrentTargetNode, handleStatusChange } = useTestDetailsStore();
  const { getTestStats } = useProjectStore();
  const { clickedTargetContext } = useTerminalStore();
  const { theme, closeRightDrawer } = useUiStore();

  const statusSelectPalette = theme.palette.statusSelect;
  const statusPalette
    = status === 'FAIL' ? statusSelectPalette.fail : status === 'PASS' ? statusSelectPalette.pass : status === 'MANUAL' ? statusSelectPalette.warning : statusSelectPalette.disabled;

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
      key: 0,
      tab: <Tab key='details' label='Test case details' />,
      content: <TestDetailsTab onFormSubmit={handleFormSave} />
    },
    REMEDIATIONS: {
      key: 1,
      tab: <Tab key='remediations' label='Remediations' />,
      content: <RemediationsTab editRemediation={editRemediation} setEditRemediation={setEditRemediation} />
    },
    NOTES: {
      key: 2,
      tab: <Tab key='notes' label='Notes' />,
      content: <NotesTab editNotes={editNotes} setEditNotes={setEditNotes} />
    }
  };

  if (section && section === TERMINAL_SECTIONS.REMEDIATIONS) {
    availableTabs.push(TABS.REMEDIATIONS, TABS.DETAILS, TABS.NOTES);
  } else {
    availableTabs.push(TABS.DETAILS);
    if (status === 'INCOMPLETE' || status === 'FAIL') {
      availableTabs.push(TABS.REMEDIATIONS, TABS.NOTES);
    }
  }

  if (!currentTargetNode || !testCase) return null;

  return (
    <Box className={style.root}>
      <Box className={style.top}>
        <Box className={style.header}>
          <Box className={style.info}>
            <Typography variant='h2' className={style.id}>
              {!isRemediationDrawer && (
                <span>
                  <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={testCase.type === 'MANUAL' ? clipboard : activity} />
                </span>
              )}
              {isRemediationDrawer ? remediation.id : testCase.id}
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

        {tab === 0 && (isRemediationDrawer ? TABS.REMEDIATIONS.content : TABS.DETAILS.content)}
        {tab === 1 && (isRemediationDrawer ? TABS.DETAILS.content : TABS.REMEDIATIONS.content)}
        {tab === 2 && TABS.NOTES.content}
      </Box>
    </Box>
  );
};

export default TestDetails;
