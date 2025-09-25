import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Atag from './Atag.component';
import style from './Audit.module.scss';
import Vpat from './Vpat.component';
import Wcag from './Wcag.component';

const Audit = ({ type, format }) => {
  const router = useRouter();
  const { id } = router.query;

  const [audit, setAudit] = useState(null);

  useEffect(() => {
    if (!id) return;
    const getAudit = async () => {
      const audit = await window.api.audit.findAuditReportItems({ id });
      setAudit(audit);
    };
    getAudit();
  }, [id]);

  if (!audit) return null;

  let Component;
  if (type === 'VPAT') {
    Component = Vpat;
  } else if (type === 'WCAG_EM') {
    Component = Wcag;
  } else if (type === 'ATAG') {
    Component = Atag;
  }

  return <main className={classNames(style.root, style[format])}><Component audit={audit} /></main>;
};

export default Audit;
