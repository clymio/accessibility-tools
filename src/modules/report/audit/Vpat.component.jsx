import { Typography } from '@mui/material';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';
import Footer from './Footer';
import Header from './Header';
import Info from './Info.component';
import SectionTable from './SectionTable.component';

const style = {
  ...layoutStyle,
  ...auditStyle
};

const Vpat = ({ audit }) => {
  const sections = audit.sections;

  const wcagSectionItems = sections.filter(s => s.chapter_id === 'WCAG');
  const section508SectionItems = sections.filter(s => s.chapter_id === 'SECTION_508');
  const en301SectionItems = sections.filter(s => s.chapter_id === 'EN_301');

  return (
    <>
      <Header audit={audit} />
      <Info audit={audit} />
      <div className={style.terms}>
        <Typography variant='h2'>Terms</Typography>
        <Typography>The terms used in the Conformance Level information are defined as follows:</Typography>
        <ul>
          <li>
            <Typography>
              <strong>Supports:</strong> The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent
              facilitation.
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Partially Supports:</strong> Some functionality of the product does not meet the criterion.
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Does Not Support:</strong> The majority of product functionality does not meet the criterion.
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Not Applicable:</strong> The criterion is not relevant to the product.
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Not Evaluated:</strong> The product has not been evaluated against the criterion. This can only be used in WCAG Level AAA criteria.
            </Typography>
          </li>
        </ul>
      </div>
      <div className={style.dataTableContainer}>
        {wcagSectionItems.map((section, i) => (
          <SectionTable key={section.id} section={{ ...section, table_name: `Table ${i + 1}` }} />
        ))}
      </div>
      {section508SectionItems.length > 0 && (
        <div className={style.dataTableContainer}>
          <Typography variant='h2' mb={1}>Revised Section 508 Report</Typography>
          {section508SectionItems.map((section, i) => (
            <SectionTable key={section.id} section={section} i={i} />
          ))}
        </div>
      )}
      {en301SectionItems.length > 0 && (
        <div className={style.dataTableContainer}>
          <Typography variant='h2' mb={1}>EN 301 549 Report</Typography>
          {en301SectionItems.map((section, i) => (
            <SectionTable key={section.id} section={section} i={i} />
          ))}
        </div>
      )}
      <Footer audit={audit} />
    </>
  );
};
export default Vpat;
