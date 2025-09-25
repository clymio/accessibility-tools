import Select from '@/modules/core/Select';
import { useSystemStore } from '@/stores';
import { useTestCaseFormStore } from '@/stores/useTestCaseFormStore';
import { useEffect, useRef } from 'react';
import styles from './TestCaseForm.module.scss';

const StepTwo = () => {
  const { standard, criteria, testType, errors, touched, setStandard, setCriteria, setTestType, setErrors } = useTestCaseFormStore();

  const { standards, criteria: criteriaOptions } = useSystemStore();

  const standardOptions = standards.map(s => ({
    value: s.id,
    label: s.name
  }));

  useEffect(() => {
    if (standardOptions.length > 0) {
      setStandard(standardOptions[0].value);
    }
  }, [standards]);

  const firstFocusableSelectElRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (firstFocusableSelectElRef.current) {
        firstFocusableSelectElRef.current.focus();
      }
    }, 100);
  }, []);

  return (
    <div className={styles.stepTwo}>
      <div className={styles.formField}>
        {standardOptions.length > 0 && (
          <Select label='Standard' value={standard} required={true} onChange={setStandard} touched={touched.standard} errors={errors.standard} options={standardOptions} />
        )}
      </div>
      <div className={styles.formField}>
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
      </div>
      <div className={styles.formField}>
        <Select
          label='Test type'
          value={testType.toUpperCase()}
          required={true}
          // TODO remove disabled once Automatic test functionality exists
          disabled={true}
          onChange={setTestType}
          touched={touched.testType}
          errors={errors.testType}
          options={[
            { label: 'Manual', value: 'MANUAL' },
            { label: 'Automatic', value: 'AUTOMATIC' }
          ]}
        />
      </div>
    </div>
  );
};

export default StepTwo;
