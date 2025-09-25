import { REPORT_TYPES } from '@/constants/report';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Test from './Test.component';
import Audit from './audit';

function ReportLayout({}) {
  const router = useRouter();

  const [query, setQuery] = useState({});

  useEffect(() => {
    if (document) {
      document.body.classList.add('pdf-body');
    }
    return () => {
      if (document) {
        document.body.classList.remove('pdf-body');
      }
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setQuery(router.query);
  }, [router.isReady, router.query]);

  const { type, audit_type, format } = query;

  let comp = null;
  if (type === REPORT_TYPES.TEST) {
    comp = <Test />;
  } else if (type === REPORT_TYPES.AUDIT) {
    comp = <Audit type={audit_type} format={format} />;
  }

  return comp;
}

export default ReportLayout;
