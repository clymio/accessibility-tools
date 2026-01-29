import WebView from '@/modules/core/WebView/WebView.component';
import { useProjectStore, useTerminalStore } from '@/stores';
import { Box, Stack } from '@mui/material';
import { useEffect } from 'react';
import Tabs from './Tabs.component';

const Project = () => {
  const { project, selectedPage, selectedTest, getTestStats } = useProjectStore();
  const { setFilter, isAudit, setIsAutomatedTestFinished, setIsPolling, setHasOccurrenceData } = useTerminalStore(state => ({
    setFilter: state.tests.setFilter,
    isAudit: state.isAudit,
    setIsAutomatedTestFinished: state.setIsAutomatedTestFinished,
    setIsPolling: state.setIsPolling,
    setHasOccurrenceData: state.setHasOccurrenceData
  }));

  const canResolve = selectedPage.id && selectedPage.id !== 'HOME' && selectedTest.id;

  let testUnsubscribeFn = null,
    pageUnsubscribeFn = null;

  useEffect(() => {
    if (!selectedTest) return;
    const isTestFinished = async () => {
      const environmentTest = await window.api.environmentTest.read({
        id: selectedTest.id
      });
      return !!environmentTest.end_date;
    };
    const getHasOccurrenceData = async () => {
      const hasData = await window.api.environmentTest.hasOccurrenceData({ id: selectedTest.id });
      setHasOccurrenceData(hasData);
    };
    const pollData = async () => {
      const finished = await isTestFinished();
      if (finished) {
        setIsAutomatedTestFinished(true);
        getTestStats(selectedTest.id);
        getHasOccurrenceData();
      } else {
        setIsAutomatedTestFinished(false);
        testUnsubscribeFn = await window.api.environmentTest.onTestCompleted(({ status, data }) => {
          if (data.test_id !== selectedTest.id) return;
          if (status === 'error') {
            window.system.showError('Test failed. Please try again or contact support.');
          } else {
            getHasOccurrenceData();
          }
          setIsAutomatedTestFinished(true);
          testUnsubscribeFn();
          pageUnsubscribeFn?.();
        });
      }
    };
    pollData();
    getTestStats(selectedTest.id);
    return () => {
      testUnsubscribeFn?.();
      pageUnsubscribeFn?.();
    };
  }, [selectedTest]);

  useEffect(() => {
    const handleDataFetchCompleted = async () => {
      setFilter({ status: 'FAIL' });
      setIsPolling(false);
    };
    const fetchTestStatus = async () => {
      if (isAudit) return true;
      if (!canResolve) return;
      const environmentTest = await window.api.environmentPage.findEnvironmentTest({
        environment_page_id: selectedPage.id,
        environment_test_id: selectedTest.id
      });
      return !!environmentTest?.end_date;
    };
    const getData = async () => {
      const isCompleted = await fetchTestStatus();
      if (isCompleted) {
        handleDataFetchCompleted();
      } else {
        setIsPolling(true);
        pageUnsubscribeFn = window.api.environmentPage.onTestCompleted(({ data }) => {
          getTestStats(selectedTest.id);
          if (data.page_id !== selectedPage.id || data.test_id !== selectedTest.id) return;
          handleDataFetchCompleted();
        });
      }
    };
    getData();

    return () => {
      pageUnsubscribeFn?.();
    };
  }, [selectedPage, selectedTest, isAudit]);

  if (!project || !selectedTest) return null;

  const url = selectedTest.environment.url;
  return (
    <Stack height='100%' width='100%'>
      <Tabs />
      <Box height='100%' width='100%' flex={1}>
        <WebView url={`${url}/${selectedPage.path}`} captureScreenshot={!project.image} projectId={project.id} />
      </Box>
    </Stack>
  );
};
export default Project;
