import Select from '@/modules/core/Select';
import { useProjectTestFormStore } from '@/stores/useProjectTestFormStore';
import { TextField, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useEffect } from 'react';
import styles from './ProjectTest.module.scss';

import { info, plus } from '@/assets/icons';
import classNames from 'classnames';
import Icon from '@/modules/core/Icon';

const StepOne = ({ environments, isEdit = false }) => {
  const {
    testName,
    environmentType,
    essentialFunctionality,
    webPageTypes,
    errors,
    touched,
    handleChange,
    handleBlur,
    setEnvironmentType
  } = useProjectTestFormStore();

  const environmentOptions = environments.map(env => ({
    value: env.id,
    label: env.name
  }));

  useEffect(() => {
    if (environments.length > 0 && !environmentType) {
      setEnvironmentType(environments[0].id);
    }
  }, [environments, environmentType, setEnvironmentType]);

  return (
    <div className={styles.stepOne}>
      <div className={styles.formField}>
        <TextField
          label='Test name'
          required
          value={testName}
          onChange={e => handleChange('testName', e.target.value)}
          onBlur={e => handleBlur('testName', e.target.value)}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched.testName && Boolean(errors.testName)}
          helperText={touched.testName && errors.testName}
        />
      </div>
      <Typography variant='body1' sx={{ mt: 2, fontWeight: 700 }}>
        Environments
      </Typography>
      <Select
        label='Environment type'
        value={environmentOptions.some(opt => opt.value === environmentType) ? environmentType : ''}
        onChange={value => handleChange('environmentType', value)}
        options={environmentOptions}
        disabled={environmentOptions.length < 1 || isEdit}
      />
      <Typography variant='body1' sx={{ mt: 2, fontWeight: 700 }}>
        Exploration notes
      </Typography>
      <div className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                Essential functionality of the website
                <Tooltip title="Provide a brief description of the website's core functionalities.">
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={essentialFunctionality}
          onChange={e => handleChange('essentialFunctionality', e.target.value)}
          onBlur={e => handleBlur('essentialFunctionality', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={4}
          className={styles.textField}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label={(
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
              Variety of web page types
              <Tooltip title='Provide a brief description of the variety of page types.'>
                <span className={styles.infoIcon}>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                </span>
              </Tooltip>
            </span>
          )}
          value={webPageTypes}
          onChange={e => handleChange('webPageTypes', e.target.value)}
          onBlur={e => handleBlur('webPageTypes', e.target.value)}
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
