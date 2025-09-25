import { info } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { useTestCaseFormStore } from '@/stores/useTestCaseFormStore';
import { TextField, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import styles from './TestCaseForm.module.scss';

const StepOne = () => {
  const {
    testName,
    reproductionSteps,
    expectedResult,
    additionalInstructions,
    selectors,
    handleBlur,
    errors,
    touched,
    setTestName,
    setReproductionSteps,
    setExpectedResult,
    setAdditionalInstructions,
    setSelectors
  } = useTestCaseFormStore();

  return (
    <div className={styles.stepOne}>
      <div className={styles.formField}>
        <TextField
          label='Test name'
          required
          value={testName ?? ''}
          onChange={e => setTestName(e.target.value)}
          onBlur={e => handleBlur('testName', e.target.value)}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.testName && Boolean(errors.testName)}
          helperText={touched?.testName && errors.testName}
          autoFocus
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Steps to reproduce</Typography>
                <Tooltip title='Provide a brief description of the steps neccessary to reproduce the test case scenario.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={reproductionSteps ?? ''}
          onChange={e => setReproductionSteps(e.target.value)}
          onBlur={e => handleBlur('reproductionSteps', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={2}
          className={styles.textField}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label={(
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
              <Typography variant='body2'>Expected result</Typography>
              <Tooltip title='Provide a brief description of the results you ecpect from the defined test case.'>
                <span className={styles.infoIcon}>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                </span>
              </Tooltip>
            </span>
          )}
          value={expectedResult ?? ''}
          onChange={e => setExpectedResult(e.target.value)}
          onBlur={e => handleBlur('expectedResult', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={2}
          className={styles.textField}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label={(
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
              <Typography variant='body2'>Additional instructions</Typography>
              <Tooltip title='Provide any additonal information needed to understand the test case scanrio.'>
                <span className={styles.infoIcon}>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                </span>
              </Tooltip>
            </span>
          )}
          value={additionalInstructions ?? ''}
          onChange={e => setAdditionalInstructions(e.target.value)}
          onBlur={e => handleBlur('additionalInstructions', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={2}
          className={styles.textField}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label={(
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
              <Typography variant='body2'>Selectors</Typography>
              <Tooltip title='Provide the CSS selectors for the test case, separated by a new line.'>
                <span className={styles.infoIcon}>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                </span>
              </Tooltip>
            </span>
          )}
          value={selectors ?? ''}
          onChange={e => setSelectors(e.target.value)}
          onBlur={e => handleBlur('selectors', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={4}
          className={styles.textField}
        />
      </div>
    </div>
  );
};

export default StepOne;
