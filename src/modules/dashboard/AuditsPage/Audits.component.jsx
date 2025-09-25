import Menu from '@/modules/core/Menu';
import AuditForm from '@/modules/dashboard/AuditsPage/Dialogs/AuditForm';
import { useAuditStore, useProjectStore, useSystemStore, useUiStore } from '@/stores';
import { circlePlus, download, edit, menu, sliders, trash, xSquare, eye } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { Box, CircularProgress, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import styles from './Audits.module.scss';
import CloseAudit from './Dialogs/CloseAudit';
import DeleteAudit from './Dialogs/DeleteAudit';
import DownloadReport from './Dialogs/DownloadReport';

export default function Audits() {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';
  const { theme } = useUiStore();
  const { audit, setAudit, setSelectedCriterion, reset } = useAuditStore();
  const { setTests, setSelectedTest, setProject } = useProjectStore();
  const { imageBasePath } = useSystemStore();

  const menuTriggerRef = useRef(null);

  const [isAuditFormDialogOpen, setIsAuditFormDialogOpen] = useState(false);
  const [isCloseAuditDialogOpen, setCloseAuditDialogOpen] = useState(false);
  const [isDeleteAuditDialogOpen, setDeleteAuditDialogOpen] = useState(false);
  const [isDownloadReportDialogOpen, setDownloadReportDialogOpen] = useState(false);
  const [audits, setAudits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [menuState, setMenuState] = useState({ anchorEl: null, audit: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menuState.anchorEl) return;
    menuTriggerRef.current = menuState.anchorEl;
  }, [menuState.anchorEl]);

  useEffect(() => {
    if (openCreate) {
      openAuditFormDialog();
    }
  }, [openCreate]);

  const fetchAuditsAndProjects = async () => {
    if (!audits.length) {
      setLoading(true);
    }
    try {
      const [auditData, projectData] = await Promise.all([window.api.audit.find({ limit: 100 }, { detailed: true }), window.api.project.find()]);
      setAudits(auditData?.result || []);
      setProjects(projectData?.result || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditsAndProjects();
  }, []);

  async function onAuditClick(newAudit, selectedTestId = null) {
    if (audit && audit.id !== newAudit.id) {
      reset();
    }
    const auditObj = await window.api.audit.findAuditReportItems({ id: newAudit.id });
    setAudit(auditObj);
    setSelectedCriterion(auditObj.sections[0].items[0]);

    const project = await window.api.project.find({ id: auditObj.project_id });
    setProject(project);

    const testsRes = await window.api.environmentTest.find({ project_id: auditObj.project_id, exclude_closed: true, limit: false }, { detailed: true });
    const tests = testsRes.result;
    let selectedTest = tests[0];
    if (selectedTestId) {
      const match = tests.find(test => test.id === selectedTestId);
      if (match) {
        selectedTest = match;
      }
    }

    setTests(tests);
    setSelectedTest(selectedTest);

    await router.push(`/audits/${auditObj.id}`);
  }

  function onMenuClick(event, audit) {
    event.preventDefault();
    event.stopPropagation();
    setMenuState({ anchorEl: event.currentTarget, audit });
    return true;
  }

  function onMenuClose() {
    setMenuState({ anchorEl: null, audit: null });
  }

  const openAuditFormDialog = () => {
    setIsAuditFormDialogOpen(true);
  };

  const closeAuditFormDialog = () => {
    setIsAuditFormDialogOpen(false);
    setTimeout(() => {
      setSelectedAudit(null);
    }, 100);
  };

  const handleAddProject = () => {
    router.push('/?openCreate=true');
  };

  const openCloseAudit = (item) => {
    setSelectedAudit(item);
    setCloseAuditDialogOpen(true);
  };

  const closeCloseAudit = () => {
    setCloseAuditDialogOpen(false);
    setSelectedAudit(null);
  };

  const openDeleteAudit = (item) => {
    setSelectedAudit(item);
    setDeleteAuditDialogOpen(true);
  };

  const closeDeleteAudit = () => {
    setDeleteAuditDialogOpen(false);
    setSelectedAudit(null);
  };

  const openDownloadReport = (item) => {
    setSelectedAudit(item);
    setDownloadReportDialogOpen(true);
  };

  const closeDownloadReport = () => {
    setDownloadReportDialogOpen(false);
    setSelectedAudit(null);
  };

  const handleAuditAdd = async (audit) => {
    await fetchAuditsAndProjects();
    if (audit) {
      await onAuditClick(audit);
    }
    if (menuTriggerRef && menuTriggerRef.current) {
      menuTriggerRef.current.focus();
    }
  };

  const getMenuItems = () => {
    if (!menuState.audit) return [];

    if (menuState.audit.status === 'CLOSED') {
      return [
        {
          label: 'Download report',
          icon: download,
          onClick: () => openDownloadReport(menuState.audit),
          divider: true
        },
        {
          label: 'Delete audit',
          icon: trash,
          onClick: () => openDeleteAudit(menuState.audit),
          isDestroyItem: true
        }
      ];
    }

    if (menuState.audit.status === 'OPEN') {
      return [
        {
          label: 'Continue audit',
          icon: edit,
          onClick: () => {
            setSelectedAudit(menuState.audit);
            onAuditClick(menuState.audit);
          }
        },
        {
          label: 'Close audit',
          icon: xSquare,
          onClick: () => {
            setSelectedAudit(menuState.audit);
            openCloseAudit(menuState.audit);
          }
        },
        {
          label: 'Edit options',
          icon: sliders,
          onClick: () => {
            setSelectedAudit(menuState.audit);
            openAuditFormDialog(menuState.audit);
          },
          divider: true
        },
        {
          label: 'Delete audit',
          icon: trash,
          onClick: () => openDeleteAudit(menuState.audit),
          isDestroyItem: true
        }
      ];
    }

    return [
      {
        label: 'Continue audit',
        icon: edit,
        onClick: () => {
          setSelectedAudit(menuState.audit);
          onAuditClick(menuState.audit);
        }
      },
      {
        label: 'Preview report',
        icon: eye,
        onClick: () => openDownloadReport(menuState.audit)
      },
      {
        label: 'Close audit',
        icon: xSquare,
        onClick: () => {
          setSelectedAudit(menuState.audit);
          openCloseAudit(menuState.audit);
        }
      },
      {
        label: 'Edit options',
        icon: sliders,
        onClick: () => {
          setSelectedAudit(menuState.audit);
          openAuditFormDialog(menuState.audit);
        },
        divider: true
      },
      {
        label: 'Delete audit',
        icon: trash,
        onClick: () => openDeleteAudit(menuState.audit),
        isDestroyItem: true
      }
    ];
  };

  if (loading) {
    return (
      <Box className={styles.splashScreen}>
        <CircularProgress className={styles.progressSpinner} color='inherit' size={80} />
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Box className={styles.splashScreen}>
        <Typography variant='body2' className={styles.splashScreenText}>
          You need a project before creating audits
        </Typography>
        <div className={styles.addAudit}>
          <Button onClick={handleAddProject}>
            <Typography>New project</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
        </div>
      </Box>
    );
  }

  if (audits.length === 0) {
    return (
      <Box className={styles.splashScreen}>
        <Typography variant='body2' className={styles.splashScreenText}>
          No audits yet. Create one to get started
        </Typography>
        <div className={styles.addAudit}>
          <Button onClick={openAuditFormDialog}>
            <Typography>New audit</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
        </div>
        <AuditForm open={isAuditFormDialogOpen} onClose={closeAuditFormDialog} onAuditAdded={handleAuditAdd} auditId={selectedAudit?.id} triggerEl={selectedAudit?.id ? menuState.anchorEl : null} />
      </Box>
    );
  }

  return (
    <div className={styles.audits}>
      <div className={styles.pageHeading}>
        <Typography variant='h2' className={styles.title}>
          Audits
        </Typography>
        <div className={styles.addAudit}>
          <Button onClick={openAuditFormDialog}>
            New audit <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
        </div>
      </div>
      <div className={styles.auditsList}>
        {audits.map((item, i) => {
          return (
            <Box key={i}>
              <div className={styles.progressContainer}>
                <div className={styles.auditProgressBar}></div>
                <div className={styles.collaboratorsConatiner}>
                  <div className={styles.collaborators}></div>
                  <div className={styles.addCollaboratorIcon}></div>
                </div>
              </div>
              <div
                role='button'
                tabIndex={0}
                key={i}
                className={styles.audit}
                onClick={() => onAuditClick(item)}
                onKeyDown={(e) => {
                  if (e.currentTarget === document.activeElement && e.key === 'Enter') {
                    e.preventDefault();
                    onAuditClick(item);
                  }
                }}
                onKeyUp={(e) => {
                  if (e.currentTarget === document.activeElement && e.key === ' ') {
                    e.preventDefault();
                    onAuditClick(item);
                  }
                }}
                aria-label={`${item.name} audit`}
              >
                <div className={classNames(styles.auditImg, { [styles.placeholder]: !item.project?.image })}>
                  <img src={item.project?.image || `${imageBasePath}/project_placeholder.png`} alt={item.url} />
                </div>
                <div className={styles.auditInfo}>
                  <div className={styles.status}>
                    <svg className={styles[item.status]} xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none'>
                      <circle
                        cx='5'
                        cy='5'
                        r='5'
                        fill={item.status === 'IN_PROGRESS' ? theme.palette.status.inProgress : item.status === 'CLOSED' ? theme.palette.status.closed : theme.palette.status.open}
                      />
                    </svg>
                  </div>
                  <div className={styles.auditName}>{item.identifier + ' - ' + item.project?.name}</div>
                  <div className={styles.auditMenu}>
                    <IconButton
                      size='small'
                      aria-label='more'
                      aria-controls='menu-button'
                      aria-haspopup='true'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMenuClick(e, item);
                      }}
                    >
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={menu} />
                    </IconButton>
                    <Menu anchorEl={menuState.anchorEl} onClose={onMenuClose} items={getMenuItems()} />
                  </div>
                </div>
              </div>
            </Box>
          );
        })}
      </div>
      <AuditForm open={isAuditFormDialogOpen} onClose={closeAuditFormDialog} onAuditAdded={handleAuditAdd} auditId={selectedAudit?.id} triggerEl={selectedAudit?.id ? menuState.anchorEl : null} />
      <CloseAudit open={isCloseAuditDialogOpen} onClose={closeCloseAudit} audit={selectedAudit} onCloseSuccess={fetchAuditsAndProjects} triggerEl={menuState.anchorEl} />
      <DeleteAudit open={isDeleteAuditDialogOpen} onClose={closeDeleteAudit} audit={selectedAudit} onDeleteSuccess={fetchAuditsAndProjects} triggerEl={menuState.anchorEl} />
      <DownloadReport open={isDownloadReportDialogOpen} onClose={closeDownloadReport} audit={selectedAudit} isPreview={selectedAudit?.status === 'IN_PROGRESS'} triggerEl={menuState.anchorEl} />
    </div>
  );
}
