import { info } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { Box, Button, Link, Typography } from '@mui/material';
import classNames from 'classnames';
import style from './RemediationInfo.module.scss';
import { useUiStore } from '@/stores';

const RemediationInfo = ({ remediation, isDrawer }) => {
  const { rightDrawerSettings } = useUiStore();
  if (!remediation) return;
  let examples = remediation.examples || [];
  examples = examples.sort((a, b) => {
    const aIdx = a.id.replace(`${remediation.id}-`, '');
    const bIdx = b.id.replace(`${remediation.id}-`, '');
    return aIdx - bIdx;
  });
  return (
    <Box className={classNames(style.root, { [style.narrow]: rightDrawerSettings.isNarrow })}>
      <Box className={style.details} mt={isDrawer ? 0 : '1rem'}>
        <Typography>{remediation.description}</Typography>
        <Typography mt='1rem'>Category: {remediation.category?.name}</Typography>
        {remediation.criteria && remediation.criteria.length > 0 && (
          <Box className={style.help}>
            <Typography>Criteria</Typography>
            <Box className={style.helpLinks}>
              {remediation.criteria.map(c => (
                <Link href={c.help_url} target='_blank' key={c.id}>
                  <Button variant='outlined' color='secondary'>
                    <Typography>Understanding {c.id}</Typography>
                    <span className={style.infoIcon}>
                      <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={info} />
                    </span>
                  </Button>
                </Link>
              ))}
            </Box>
          </Box>
        )}
        {examples && examples.length > 0 && (
          <Box className={style.examples}>
            <Typography>Examples</Typography>
            <ul>
              {examples.map(e => (
                <li key={e.id}>
                  <Typography>{e.name}</Typography>
                  <pre>
                    <code>{e.code}</code>
                  </pre>
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default RemediationInfo;
