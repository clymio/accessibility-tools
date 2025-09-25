import Layout from '@/modules/core/Layout';
import SettingsPage from '../modules/dashboard/SettingsPage';

export default function Home() {
  return <Layout page={SettingsPage} removeContentPadding={true} />;
}
