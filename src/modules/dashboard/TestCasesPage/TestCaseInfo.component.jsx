import { info } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import style from './TestCaseInfo.module.scss';
import { useUiStore } from '@/stores';

const TestCaseInfo = ({ testCase }) => {
  const { rightDrawerSettings } = useUiStore();
  if (!testCase) return;
  return (
    <Box className={classNames(style.root, { [style.narrow]: rightDrawerSettings.isNarrow })}>
      <Box className={style.content}>
        {testCase.steps && (
          <Box className={style.stepsWrapper}>
            <Typography className={style.stepsLabel}>Steps:</Typography>
            <ul className={style.steps}>
              {testCase.steps.split('\n').map((step, index) => (
                <li key={index}>
                  <Typography>{step}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
        {testCase.result && (
          <Box className={style.resultWrapper}>
            {testCase.result.includes('\n')
              ? (
                <>
                  <Typography className={style.stepsLabel}>Expected result:</Typography>
                  <ul className={style.steps}>
                    {testCase.result.split('\n').map((result, index) => (
                      <li key={index}>
                        <Typography>{result}</Typography>
                      </li>
                    ))}
                  </ul>
                </>
                )
              : (
                <Typography className={style.result}>Expected result: {testCase.result}</Typography>
                )}
          </Box>
        )}
      </Box>
      {testCase.criteria && testCase.criteria.length > 0 && (
        <Box className={style.help}>
          <Typography>Criteria</Typography>
          <Box className={style.helpLinks}>
            {testCase.criteria.map(c => (
              <Button LinkComponent='a' href={c.help_url} target='_blank' key={c.id} variant='outlined' color='secondary' className={style.helpLink}>
                <Typography>Understanding {c.id}</Typography>
                <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={info} />
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default TestCaseInfo;
