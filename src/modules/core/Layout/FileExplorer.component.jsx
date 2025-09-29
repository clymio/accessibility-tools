'use strict';
import { pictureAsPdf } from '@/assets/icons';
import { FILE_EXPLORER_DEFAULT_WIDTH, FILE_EXPLORER_MAX_WIDTH_PERCENTAGE, FILE_EXPLORER_MIN_WIDTH, HEADER_HEIGHT } from '@/constants/app';
import Icon from '@/modules/core/Icon';
import LinearProgress from '@/modules/core/LinearProgress/LinearProgress.component';
import Overview from '@/modules/dashboard/ProjectPage/ProjectTestStats/Overview';
import { useAuditStore, useProjectStore, useTerminalStore, useUiStore } from '@/stores';
import { Box, Button, Chip, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import Principles from '../../dashboard/ProjectPage/ProjectTestStats/Principles/Principles.component';
import Accordion from '../Accordion';
import ResizableBlock from '../ResizableBlock';
import Sitemap from '../Sitemap';
import style from './FileExplorer.module.scss';

function TestSelector({ tests }) {
  if (tests.length === 1) {
    return <Chip variant='outlined' label={tests[0].name} className={style.chip} />;
  }
  const { selectedTest, setSelectedTest } = useProjectStore();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };
  const handleEnvironmentClick = (e, env) => {
    e.stopPropagation();
    setSelectedTest(env);
    handleClose(e);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'environment-select-popover' : undefined;

  return (
    <>
      <Chip aria-describedby={id} variant='outlined' label={selectedTest.name} className={style.chip} onClick={handleClick} />
      <Menu
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        onClick={e => e.stopPropagation()}
      >
        {tests.map((env, i) => (
          <MenuItem disabled={selectedTest.id === env.id} dense key={i} onClick={e => handleEnvironmentClick(e, env)}>
            <Typography>{env.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const renderAuditMode = () => {
  const { audit, selectedCriterion, setSelectedCriterion, auditStats, setAuditStats, getAuditStats } = useAuditStore();
  const { project } = useProjectStore();
  const { testsFilter, setTestsFilter } = useTerminalStore(state => ({
    testsFilter: state.tests.filter,
    setTestsFilter: state.tests.setFilter
  }));
  const parentSummaryRefs = useRef({});

  const handleCriteriaClick = (item) => {
    setSelectedCriterion(item);
    const newFilter = { ...testsFilter, criteria: item.criteria?.id };
    setTestsFilter(newFilter);
  };

  useEffect(() => {
    if (!audit?.id) return;

    getAuditStats(audit);

    return () => {
      setAuditStats(undefined);
    };
  }, [audit?.id]);

  const handleKeyDown = (e, sectionId, item) => {
    e.preventDefault();
    if (e.key === 'ArrowDown') {
      e.currentTarget.nextElementSibling?.focus();
    } else if (e.key === 'ArrowUp') {
      e.currentTarget.previousElementSibling?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleCriteriaClick(item);
    } else if (e.key === 'Tab' || e.key === 'Escape' || e.key === ' ') {
      parentSummaryRefs.current[sectionId]?.focus();
    }
  };

  return (
    <>
      <Accordion
        title={audit.identifier + ' - ' + project.name}
        expanded
        disableSummaryClick
        rightIcon={false}
        hideRightLabel
        className={classNames(style.accordion, style.auditAccordion)}
        detailsClassName={style.accordionDetails}
      >
        {audit.sections.map((section, index) => (
          <Accordion
            key={section.id}
            title={`${section.name}`}
            rightElement={<Chip label={section.items.length} size='small' />}
            rightElementClassName={style.chipWrapper}
            hideRightLabel
            expanded={index === 0}
            disabled={section.items.length === 0}
            isChildAccordion
            className={classNames(style.accordion, style.childAccordion)}
            detailsClassName={style.accordionDetails}
            summaryRef={(el) => {
              parentSummaryRefs.current[section.id] = el;
            }}
          >
            {section.items.map(item => (
              <Typography
                key={item.id}
                className={classNames(style.auditItem, { [style.active]: selectedCriterion?.id === item.id })}
                noWrap
                component='div'
                role='button'
                tabIndex={0}
                title={item.label}
                onClick={() => handleCriteriaClick(item)}
                sx={{ cursor: 'pointer' }}
                onKeyDown={e => handleKeyDown(e, section.id, item)}
              >
                {item.name}
              </Typography>
            ))}
          </Accordion>
        ))}
      </Accordion>
      {auditStats?.items?.length > 0 && (
        <Accordion
          titleComponent={(
            <Box className={style.accordionTitle} sx={{ paddingBottom: '1rem' }}>
              <Box className={style.titleSummary}>
                <Typography>{auditStats.title}</Typography>
                <Typography>{auditStats.updated + ' of ' + auditStats.total}</Typography>
              </Box>
              <LinearProgress total={auditStats.total} current={auditStats.updated} />
            </Box>
          )}
          hideRightLabel
          className={classNames(style.accordion, style.progressAccordion, style.auditStatsAccordion)}
          summaryClassName={style.progressAccordionSummary}
          detailsClassName={style.progressAccordionDetails}
        >
          <Box>
            <Box className={style.stats}>
              {auditStats.items.map((stat, i) => (
                <Box className={style.stat} key={i}>
                  <Box className={style.statTitle}>
                    <Typography className={style.statName}>{stat.name}</Typography>
                    <Typography className={style.statNumbers}>{stat.updated + ' of ' + stat.total}</Typography>
                  </Box>
                  <LinearProgress total={stat.total} current={stat.updated} />
                </Box>
              ))}
            </Box>
          </Box>
        </Accordion>
      )}
    </>
  );
};

export default function FileExplorer({ id }) {
  const isAuditPage = typeof window !== 'undefined' && window.location.pathname.includes('/audit');
  const { project, tests, selectedTest, setSelectedPage, testStats, setTestStats, getTestStats } = useProjectStore();
  const { audit, selectedCriterion, setSelectedCriterion } = useAuditStore();
  const { filter, setFilter, fetchData, setPageId, setTestId, setIsAudit, testsFilter, setTestsFilter, setHideTerminal } = useTerminalStore(state => ({
    testsFilter: state.tests.filter,
    setTestsFilter: state.tests.setFilter,
    fetchData: state.tests.fetchData,
    filter: state.filter,
    setFilter: state.setFilter,
    reset: state.reset,
    setPageId: state.setPageId,
    setTestId: state.setTestId,
    setIsAudit: state.setIsAudit,
    setHideTerminal: state.setHideTerminal
  }));

  const ref = useRef(null);
  const { width } = useUiStore(({ editor }) => ({ width: editor.width }));
  const [sitemap, setSitemap] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [isAutomatedTestFinished, setIsAutomatedTestFinished] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloadLoading(true);
    await window.api.environmentTest.generateReport({ id: selectedTest.id });
    setIsDownloadLoading(false);
  };

  useEffect(() => {
    if (!selectedTest) {
      return;
    }
    const getSitemap = async () => {
      const newSitemap = await window.api.environmentTest.getSitemap({ id: selectedTest.id });
      setSitemap(newSitemap);
      if (!newSitemap[0].not_clickable) {
        setSelectedPage(newSitemap[0]);
      } else {
        const envTest = await window.api.environmentTest.find({ id: selectedTest.id }, { detailed: true });
        setSelectedPage(envTest.structured_pages[0]);
      }
    };
    getSitemap();
  }, [selectedTest]);

  useEffect(() => {
    if (!selectedTest) {
      return;
    }
    const isTestFinished = async () => {
      const environmentTest = await window.api.environmentTest.read({
        id: selectedTest.id
      });
      return !!environmentTest.end_date;
    };
    const interval = setInterval(async () => {
      const finished = await isTestFinished();
      if (finished) {
        setIsAutomatedTestFinished(true);
        clearInterval(interval);
        getTestStats(selectedTest.id);
      } else {
        getTestStats(selectedTest.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTest]);

  useEffect(() => {
    if (!isAuditPage || !audit || selectedCriterion) return;
    const firstCriterion = audit.sections[0]?.items[0];
    if (firstCriterion) {
      setSelectedCriterion(firstCriterion);
    }
  }, [isAuditPage, audit, selectedCriterion]);

  useEffect(() => {
    if (!isAuditPage || !audit || !selectedCriterion) return;
    setPageId('');
    setTestId(audit.environment_test_id);
    setIsAudit(true);
    const newFilter = { ...filter, criteria: selectedCriterion.criteria?.id };
    setFilter(newFilter);
    if (!testsFilter.status) {
      const newTestsFilter = { ...testsFilter, status: 'FAIL' };
      setTestsFilter(newTestsFilter);
    }
    if (!selectedCriterion || (selectedCriterion && selectedCriterion.criteria !== null)) {
      fetchData();
      setHideTerminal(false);
    } else {
      setHideTerminal(true);
    }
  }, [isAuditPage, audit, selectedCriterion]);

  if (!isAuditPage && (!project || !selectedTest)) return null;
  if (isAuditPage && !audit) return null;

  const PROGRESS_TABS = [
    {
      label: 'Overview',
      component: <Overview stats={testStats} />
    },
    {
      label: 'Principles',
      component: <Principles stats={testStats?.principleStats} />
    }
  ];

  const maxWidth = width * (FILE_EXPLORER_MAX_WIDTH_PERCENTAGE / 100);
  return (
    <ResizableBlock width={FILE_EXPLORER_DEFAULT_WIDTH} height={NaN} minWidth={FILE_EXPLORER_MIN_WIDTH} maxConstraints={[maxWidth, 0]} resizeHandles={['e']} closeable>
      <nav id={id} className={style.root} ref={ref} style={{ '--top-margin': `${HEADER_HEIGHT}px` }} tabIndex={-1}>
        {!isAuditPage
          ? (
            <>
              <Accordion
                title={project.name}
                rightElement={<TestSelector tests={tests} />}
                hideRightLabel
                expanded
                className={classNames(style.accordion, style.overflowedAccordion)}
                detailsClassName={style.accordionDetails}
                sx={{
                  '& .MuiCollapse-root': {
                    overflow: 'hidden'
                  }
                }}
              >
                <Accordion
                  title='Site Map'
                  hideRightLabel
                  defaultExpanded
                  expanded
                  isChildAccordion
                  className={classNames(style.accordion, style.childAccordion)}
                  detailsClassName={style.accordionDetails}
                >
                  <Sitemap sitemap={sitemap} />
                </Accordion>
              </Accordion>
              {testStats && (
                <Accordion
                  titleComponent={(
                    <Box className={style.accordionTitle}>
                      <Box className={style.titleSummary}>
                        <Tooltip title={selectedTest.name} placement='top'>
                          <Typography className={style.name}>{selectedTest.name}</Typography>
                        </Tooltip>
                        <Typography className={style.counter}>
                          {testStats.completed?.toLocaleString()} / {testStats.total?.toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress variant='determinate' className={style.progressBar} current={testStats.completed} total={testStats.total} />
                      <Box className={style.caption}>
                        {testStats.totalPages && <Typography className={style.description}>for the {testStats.totalPages} selected pages in test</Typography>}
                        <Tooltip title={!isAutomatedTestFinished ? 'PDF report will be available when the test is complete' : 'Download PDF report'} arrow>
                          <span>
                            <IconButton name='download pdf' aria-label='download pdf' onClick={handleDownload} disabled={isDownloadLoading || !isAutomatedTestFinished}>
                              <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={pictureAsPdf} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                  hideRightLabel
                  className={classNames(style.accordion, style.progressAccordion)}
                  summaryClassName={style.progressAccordionSummary}
                  detailsClassName={style.progressAccordionDetails}
                >
                  <Box>
                    <Box className={style.tabs}>
                      {PROGRESS_TABS.map((tab, i) => (
                        <Button variant='outlined' onClick={() => setSelectedTab(i)} key={i} className={classNames(style.tabButton, { [style.active]: i === selectedTab })}>
                          <Typography>{tab.label}</Typography>
                        </Button>
                      ))}
                    </Box>
                    <Box className={style.tab}>{PROGRESS_TABS[selectedTab].component}</Box>
                  </Box>
                </Accordion>
              )}
            </>
            )
          : (
              renderAuditMode()
            )}
      </nav>
    </ResizableBlock>
  );
}
