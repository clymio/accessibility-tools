import { useSystemStore } from '@/stores';
import { Typography } from '@mui/material';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';

const style = {
  ...layoutStyle,
  ...auditStyle
};

const Footer = ({ audit }) => {
  const { imageBasePath } = useSystemStore();

  return (
    <footer>
      {audit.disclaimer && (
        <div className={style.disclaimer}>
          <Typography variant='h2'>Legal Disclaimer</Typography>
          <Typography className={style.disclaimerText}>{audit.disclaimer}</Typography>
        </div>
      )}
      <div className={style.poweredBy}>
        <img src={`${imageBasePath}/logo_extended.png`} alt='Accessibility Tools' height='16px' className={style.appLogo} />
        <Typography variant='body1'>
          powered by
        </Typography>
        <img src={`${imageBasePath}/clym_extended.png`} alt='Clym' height='16px' className={style.clymLogo} />
      </div>
    </footer>
  );
};
export default Footer;
