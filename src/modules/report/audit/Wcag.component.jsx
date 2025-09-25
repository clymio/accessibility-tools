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

const Wcag = ({ audit }) => {
  return (
    <>
      <Header audit={audit} />
      <Info audit={audit} />
      <Typography variant='h2' mt='2rem'>Detailed Audit Results</Typography>
      <Typography variant='h3' mt='1rem'>Summary</Typography>
      <Summary audit={audit} type='WCAG' />
      <div className={style.dataTableContainer}>
        <Typography variant='h3' mt='1rem'>All Results</Typography>
        {audit.sections.map((section, i) => (
          <SectionTable section={{ ...section, table_name: `Table ${i + 1}` }} key={i} />
        ))}
      </div>
      <Footer audit={audit} />
    </>
  );
};
export default Wcag;
