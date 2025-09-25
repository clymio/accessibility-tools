import { Typography } from '@mui/material';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';
import Footer from './Footer';
import Header from './Header';
import Info from './Info.component';
import SectionTable from './SectionTable.component';
import Summary from './Summary.component';

const style = {
  ...layoutStyle,
  ...auditStyle
};

const Atag = ({ audit }) => {
  const sections = audit.sections;
  return (
    <>
      <Header audit={audit} />
      <Info audit={audit} />
      <Typography variant='h2' mt='2rem'>Detailed Audit Results</Typography>
      <Typography variant='h3' mt='1rem'>Summary</Typography>
      <Summary audit={audit} />
      <div className={style.dataTableContainer}>
        {sections.map((section, i) => (
          <SectionTable section={section} showTableName key={i} />
        ))}
      </div>
      <Footer audit={audit} />
    </>
  );
};
export default Atag;
