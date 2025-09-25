import Layout from '@/modules/core/Layout';
import AuditsPage from '../../modules/dashboard/AuditsPage';
export default function Home() {
  return <Layout page={AuditsPage} sx={{ maxHeight: '60%' }} />;
}
