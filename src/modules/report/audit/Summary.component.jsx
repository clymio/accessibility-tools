import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import layoutStyle from '../Layout.module.scss';
import auditStyle from './Audit.module.scss';

const style = {
  ...layoutStyle,
  ...auditStyle
};

const LEVEL_LABELS = {
  PASSED: 'Passed',
  FAILED: 'Failed',
  CANNOT_TELL: 'Cannot tell',
  NOT_APPLICABLE: 'Not present',
  NOT_CHECKED: 'Not checked'
};

const LEVEL_ORDER = ['PASSED', 'FAILED', 'CANNOT_TELL', 'NOT_APPLICABLE', 'NOT_CHECKED'];

const CONFORMANCES = {
  A: ['A'],
  AA: ['A', 'AA'],
  AAA: ['A', 'AA', 'AAA']
};

const Summary = ({ audit }) => {
  const [stats, setStats] = useState();
  useEffect(() => {
    const getStats = async () => {
      const stats = await window.api.audit.getStats({ id: audit.id });
      setStats(stats);
    };
    getStats();
  }, [audit]);

  if (!stats || !stats.levels) return;

  const levels = stats.levels;
  const type = audit.system_audit_type_id;

  return (
    <>
      <Typography mt='0.5rem'>Reported on <strong>{stats.updated}</strong> of <strong>{stats.total}</strong> {type === 'WCAG_EM' ? `WCAG ${audit.wcag_version} ${audit.conformance_target}` : `Level ${CONFORMANCES[audit.conformance_target]?.join(', ')}`} Success Criteria.</Typography>
      <ul>
        {LEVEL_ORDER.map((level) => {
          return (
            (
              <li key={level}>
                <Typography>
                  {levels?.[level]?.total || 0} {LEVEL_LABELS?.[level]}
                </Typography>
              </li>
            )
          );
        })}
      </ul>
    </>
  );
};
export default Summary;
