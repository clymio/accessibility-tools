import { info } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import Select from '@/modules/core/Select';
import { useSystemStore } from '@/stores';
import { useRemediationFormStore } from '@/stores/useRemediationFormStore';
import { debounce, TextField, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import styles from './RemediationForm.module.scss';

const StepTwo = () => {
  const { category, criteria, tests, selectors, setCategory, setCriteria, setTests, setSelectors, touched, errors, handleBlur } = useRemediationFormStore();
  const { categories, criteria: criteriaOptions } = useSystemStore();

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [testOptions, setTestOptions] = useState([]);

  const fetchTestCaseOptions = useMemo(
    () =>
      debounce(async (value) => {
        if (!value) {
          setTestOptions([]);
          return;
        }
        value = value
          .split('\n')
          .map(i => i.trim())
          .filter(Boolean);
        if (!value.length) {
          setTestOptions([]);
          return;
        }
        const testCases = await window.api.testCase.find({
          selectors: value,
          limit: false
        });
        const tcIds = testCases.result.map(i => i.id);
        const validTests = tests.filter(t => tcIds.includes(t));
        setTests(validTests);
        const options = testCases.result.map(item => ({ value: item.id, label: `${item.id}: ${item.name}` }));
        setTestOptions(options);
      }, 400),
    []
  );

  useEffect(() => {
    if (categories.length) {
      const options = categories.map(item => ({ value: item.id, label: item.name }));
      setCategoryOptions(options);
      if (!category) {
        setCategory(options[0]?.value || '');
      }
    }
  }, [categories]);

  useEffect(() => {
    fetchTestCaseOptions(selectors);
  }, [selectors, fetchTestCaseOptions]);

  return (
    <div className={styles.stepTwo}>
      <div className={styles.formField}>
        <Select
          label='Category'
          value={categoryOptions.some(o => o.value === category) ? category : ''}
          onChange={setCategory}
          touched={touched.category}
          errors={errors.category}
          options={categoryOptions}
          required
        />
      </div>
      <div className={styles.formField}>
        <Select
          label='Criteria'
          placeHolder='Select criteria'
          value={criteria}
          onChange={setCriteria}
          options={criteriaOptions.map(c => ({ value: c.id, label: `${c.id}: ${c.name}` }))}
          index={0}
          required
          multiple
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
      <div className={styles.formField}>
        <Select
          label={(
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
              <Typography variant='body2'>Test cases</Typography>
              <Tooltip title='Test cases to be included in the remediation, filtered by the provided selectors.'>
                <span className={styles.infoIcon}>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                </span>
              </Tooltip>
            </span>
          )}
          placeHolder='Select test cases'
          value={tests}
          onChange={setTests}
          options={testOptions}
          index={0}
          multiple
        />
      </div>
    </div>
  );
};

export default StepTwo;
