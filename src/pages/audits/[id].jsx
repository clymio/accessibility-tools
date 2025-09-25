import Layout from '@/modules/core/Layout';
import Audit from '@/modules/dashboard/AuditPage';
export default function Home() {
  return <Layout page={Audit} showFileExplorer showTerminal removeContentPadding />;
}
