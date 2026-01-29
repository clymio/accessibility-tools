import { circlePlus, filePlus, globePointer, link, menu, sliders, trash, zap } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import Menu from '@/modules/core/Menu';
import ProjectForm from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectForm';
import { useSystemStore } from '@/stores';
import { useProjectStore } from '@/stores/useProjectStore';
import { Box, CircularProgress, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DeleteProject from './Dialogs/DeleteProject';
import OpenTestsModal from './Dialogs/OpenTests';
import { StartTest } from './Dialogs/ProjectTest';
import styles from './Projects.module.scss';

export default function Projects() {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';
  const { project, setProject, setTests, setSelectedTest, reset } = useProjectStore();
  const { imageBasePath } = useSystemStore();

  const [isProjectFormDialogOpen, setProjectFormDialogOpen] = useState(false);
  const [isStartTestDialogOpen, setStartTestDialogOpen] = useState(false);
  const [isOpenTestDialogOpen, setIsOpenTestDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [menuState, setMenuState] = useState({ anchorEl: null, project: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (openCreate) {
      openProjectFormDialog();
    }
  }, [openCreate]);

  const fetchProjects = async () => {
    if (!projects.length) {
      setLoading(true);
    }
    try {
      const data = await window.api.project.find({ limit: 100 });
      setProjects(data?.result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  async function onProjectClick(newProject, selectedTestId = null) {
    if (project && project.id !== newProject.id) {
      reset();
    }
    const projectObj = await window.api.project.read({ id: newProject.id });
    setProject(projectObj);
    const testsRes = await window.api.environmentTest.find({ project_id: projectObj.id, exclude_closed: true, exclude_failed: true, limit: false }, { detailed: true });
    const tests = testsRes.result;
    if (tests.length === 0) {
      setSelectedProject(projectObj);
      openStartTest(projectObj);
      return;
    }
    let selectedTest = tests[0];
    if (selectedTestId) {
      const match = tests.find(test => test.id === selectedTestId);
      if (match) {
        selectedTest = match;
      }
    }

    setTests(tests);
    setSelectedTest(selectedTest);
    router.push(`/projects/${projectObj.id}`);
  }

  function onMenuClick(event, project) {
    setMenuState({ anchorEl: event.currentTarget, project });
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  function onMenuClose() {
    setMenuState({ anchorEl: null, project: null });
  }

  const openProjectFormDialog = () => {
    setProjectFormDialogOpen(true);
  };

  const closeProjectFormDialog = () => {
    setProjectFormDialogOpen(false);
    setTimeout(() => {
      setSelectedProject(null);
    }, 100);
  };

  const openStartTest = (item) => {
    setSelectedProject(item);
    setStartTestDialogOpen(true);
    return item;
  };

  const closeStartTest = () => {
    setStartTestDialogOpen(false);
    setSelectedProject(null);
  };

  const openTestsDialog = (item) => {
    setIsOpenTestDialogOpen(true);
    setSelectedProject(item);
  };

  const closeTestsDialog = () => {
    setIsOpenTestDialogOpen(false);
    setSelectedProject(null);
  };

  const openDeleteProject = (item) => {
    setSelectedProject(item);
    setDeleteProjectDialogOpen(true);
  };

  const closeDeleteProject = () => {
    setDeleteProjectDialogOpen(false);
    setSelectedProject(null);
  };

  const handleProjectAdd = (project) => {
    fetchProjects();
    if (project) {
      openStartTest(project);
    }
  };

  const handleTestAdd = (test, project) => {
    if (test && project) {
      onProjectClick(project, test.id);
    }
  };

  const menuItems = [
    {
      label: 'Edit project',
      icon: sliders,
      onClick: () => {
        setSelectedProject(menuState.project);
        openProjectFormDialog(menuState.project);
      }
    },
    {
      label: 'Start test',
      icon: zap,
      onClick: () => openStartTest(menuState.project)
    },
    {
      label: 'Open test',
      icon: filePlus,
      onClick: () => openTestsDialog(menuState.project),
      divider: true
    },
    {
      label: 'Delete project',
      icon: trash,
      onClick: () => openDeleteProject(menuState.project),
      isDestroyItem: true
    }
  ];

  if (loading) {
    return (
      <Box className={styles.noProjects}>
        <CircularProgress className={styles.progressSpinner} color='inherit' size={80} />
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Box className={styles.noProjects}>
        <Typography variant='body2' className={styles.noProjectText}>
          Please start by creating a project
        </Typography>
        <div className={styles.addProject}>
          <Button onClick={openProjectFormDialog}>
            <Typography>New project</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
        </div>
        <ProjectForm open={isProjectFormDialogOpen} onClose={closeProjectFormDialog} onProjectAdded={handleProjectAdd} projectId={selectedProject?.id} />
      </Box>
    );
  }

  return (
    <div className={styles.projects}>
      <div className={styles.pageHeading}>
        <Typography variant='h2' className={styles.title}>
          Projects
        </Typography>
        <div className={styles.addProject}>
          <Button onClick={openProjectFormDialog}>
            <Typography>New project</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
        </div>
      </div>

      <div className={styles.projectsList}>
        {projects.map((item, i) => (
          <div
            role='button'
            tabIndex={0}
            key={i}
            className={styles.project}
            onClick={() => onProjectClick(item)}
            onKeyDown={(e) => {
              if (e.currentTarget === document.activeElement && e.key === 'Enter') {
                e.preventDefault();
                onProjectClick(item);
              }
            }}
            onKeyUp={(e) => {
              if (e.currentTarget === document.activeElement && e.key === ' ') {
                e.preventDefault();
                onProjectClick(item);
              }
            }}
            aria-label={`${item.name} project`}
          >
            <div className={classNames(styles.projectImg, { [styles.placeholder]: !item.image })}>
              <img src={item.image || `${imageBasePath}/project_placeholder.png`} alt={item.name} />
            </div>
            <div className={styles.projectInfo}>
              <div className={styles.projectName}>
                <Typography variant='body1'>{item.name}</Typography>
                <span className={styles.projectIcon}>
                  {item.connected
                    ? (
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={link} />
                      )
                    : (
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={globePointer} />
                      )}
                </span>
              </div>
              <div className={styles.projectMenu}>
                <IconButton
                  size='small'
                  aria-label='more actions'
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
                <Menu anchorEl={menuState.anchorEl} onClose={onMenuClose} items={menuItems} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <ProjectForm open={isProjectFormDialogOpen} onClose={closeProjectFormDialog} onProjectAdded={handleProjectAdd} projectId={selectedProject?.id} />
      <StartTest
        open={isStartTestDialogOpen}
        onClose={closeStartTest}
        project={selectedProject}
        onTestStarted={(test, project) => handleTestAdd(test, project)}
        triggerEl={menuState.anchorEl}
      />
      <OpenTestsModal
        open={isOpenTestDialogOpen}
        onClose={closeTestsDialog}
        project={selectedProject}
        onTestOpen={test => onProjectClick(selectedProject, test)}
        triggerEl={menuState.anchorEl}
      />
      <DeleteProject open={isDeleteProjectDialogOpen} onClose={closeDeleteProject} project={selectedProject} onDeleteSuccess={fetchProjects} triggerEl={menuState.anchorEl} />
    </div>
  );
}
