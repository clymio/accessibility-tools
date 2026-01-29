import Layout from '@/modules/core/Layout';
import Project from '@/modules/dashboard/ProjectPage';

export default function Home() {
  return <Layout page={Project} showFileExplorer showTerminal removeContentPadding showRightDrawer />;
}
