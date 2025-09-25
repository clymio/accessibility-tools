import WebView from '@/modules/core/WebView/WebView.component';
import { useProjectStore } from '@/stores/useProjectStore';
import { Box, Stack } from '@mui/material';
import Tabs from './Tabs.component';

const Project = () => {
  const { project, selectedPage, selectedTest } = useProjectStore();
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
