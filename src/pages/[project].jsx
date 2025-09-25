import Layout from '@/modules/core/Layout';
import ProjectPage from '@/modules/dashboard/ProjectPage';
export default function Home() {
  return <Layout page={ProjectPage} showFileExplorer showTerminal removeContentPadding showRightDrawer />;
}
