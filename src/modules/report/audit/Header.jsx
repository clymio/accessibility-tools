import { Typography } from '@mui/material';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';

const style = {
  ...layoutStyle,
  ...auditStyle
};
const TITLES = { VPAT: 'Accessibility Conformance Report International Edition', WCAG_EM: 'WCAG Report', ATAG: 'ATAG Report' };

const Header = ({ audit }) => {
  const type = audit.system_audit_type_id;
  return (
    <header>
      <Typography variant='h1' className={style.title}>{TITLES[type]}</Typography>
    </header>
  );
};
export default Header;
