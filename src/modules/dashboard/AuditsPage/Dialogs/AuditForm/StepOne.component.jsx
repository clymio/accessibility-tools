import Select from '@/modules/core/Select';
import { useSystemStore } from '@/stores';
import { useAuditFormStore } from '@/stores/useAuditFormStore';
import { FormControl, TextField, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import classNames from 'classnames';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Icon from '@/modules/core/Icon';
import { info } from '@/assets/icons';
import styles from './AuditForm.module.scss';

const StepOne = ({}) => {
  const wcagVersionOptions = [
    { value: '2.0', label: 'WCAG 2.0' },
    { value: '2.1', label: 'WCAG 2.1' },
    { value: '2.2', label: 'WCAG 2.2' }
  ];

  const conformanceTargetOptions = [
    {
      value: 'A',
      label: 'Level A'
    },
    {
      value: 'AA',
      label: 'Level AA'
    },
    {
      value: 'AAA',
      label: 'Level AAA'
    }
  ];

  const {
    auditId,
    reportType,
    wcagVersion,
    conformanceTarget,
    reportIdentifier,
    reportDate,
    auditVersion,
    setReportType,
    setWcagVersion,
    setConformanceTarget,
    setReportIdentifier,
    setReportDate,
    setAuditVersion,
    setHasInitializedChapters,
    handleBlur,
    touched,
    errors
  } = useAuditFormStore();

  const {
    auditTypes
  } = useSystemStore();

  const datePicketInputRef = useRef(null);

  const [auditVersionOptions, setAuditVersionOptions] = useState([]);

  const reportTypeOptions = auditTypes?.map(type => ({
    value: type.id,
    label: type.name
  })) ?? [];

  useEffect(() => {
    const selectedOption = auditTypes.find(opt => opt.id === reportType);
    if (selectedOption?.versions?.length) {
      const versionOptions = selectedOption.versions.map(version => ({
        value: version.id,
        label: version.name
      }));
      setAuditVersionOptions(versionOptions);
      if (!auditVersion) {
        setAuditVersion(versionOptions[0].value);
      }
    } else {
      setAuditVersionOptions([]);
      setAuditVersion('');
    }
  }, [reportType]);

  useEffect(() => {
    if (!reportType && reportTypeOptions.length) {
      setReportType(reportTypeOptions[0].value);
    }
    if (!wcagVersion && wcagVersionOptions.length) {
      setWcagVersion(wcagVersionOptions[0].value);
    }
    if (!conformanceTarget) {
      setConformanceTarget(conformanceTargetOptions[0].value);
    }
  }, [reportTypeOptions, conformanceTargetOptions, wcagVersionOptions]);

  const handleDatePickerChange = (date) => {
    setReportDate(date);
    handleBlur('reportDate');
    if (datePicketInputRef.current) {
      datePicketInputRef.current.focus();
    }
  };

  const handleCalendarOpen = () => {
    setTimeout(() => {
      const focusTarget
        = document.querySelector('.react-datepicker__day--keyboard-selected')
        || document.querySelector('.react-datepicker__day--selected')
        || document.querySelector('.react-datepicker__day:not(.react-datepicker__day--disabled)');
      if (focusTarget) focusTarget.focus();
    }, 0);
  };

  return (
    <div className={styles.stepOne}>
      <Select
        label='Audit type'
        value={reportTypeOptions.some(opt => opt.value === reportType) ? reportType : reportTypeOptions[0]?.value}
        onChange={(val) => {
          setReportType(val);
          setHasInitializedChapters(false);
        }}
        onBlur={() => handleBlur('auditType')}
        options={reportTypeOptions}
        disabled={reportTypeOptions.length < 1 || !!auditId}
        touched={touched.reportType}
        errors={errors.reportType}
      />
      <Select
        label='WCAG Version'
        value={wcagVersionOptions.some(opt => opt.value === wcagVersion) ? wcagVersion : wcagVersionOptions[0].value}
        onChange={setWcagVersion}
        onBlur={() => handleBlur('wcagVersion')}
        options={wcagVersionOptions}
        disabled={wcagVersionOptions.length < 1 || !!auditId}
        touched={touched.wcagVersion}
        errors={errors.wcagVersion}
      />

      {reportType === 'VPAT' && (
        <Select
          label='Audit version'
          value={auditVersionOptions.some(opt => opt.value === auditVersion) ? auditVersion : auditVersionOptions[0]?.value}
          onChange={(val) => {
            setAuditVersion(val);
            setHasInitializedChapters(false);
          }}
          onBlur={() => handleBlur('auditVersion')}
          options={auditVersionOptions}
          disabled={auditVersionOptions.length < 1 || !!auditId}
          touched={touched.auditVersion}
          errors={errors.auditVersion}
        />
      )}
      <Select
        label='Conformance target'
        value={conformanceTargetOptions.some(opt => opt.value === conformanceTarget) ? conformanceTarget : conformanceTargetOptions[0].value}
        onChange={(val) => {
          setConformanceTarget(val);
          setHasInitializedChapters(false);
        }}
        onBlur={() => handleBlur('conformanceTarget')}
        options={conformanceTargetOptions}
        disabled={conformanceTargetOptions.length < 1 || !!auditId}
        touched={touched.conformanceTarget}
        errors={errors.conformanceTarget}
      />
      <div className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }} className={errors.reportIdentifier ? styles.error : ''}>
                Report Identifier <span>*</span>
                <Tooltip title='Date, internal version or other'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={reportIdentifier}
          onChange={e => setReportIdentifier(e.target.value)}
          onBlur={() => handleBlur('reportIdentifier')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched.reportIdentifier && Boolean(errors.reportIdentifier)}
          helperText={touched?.reportIdentifier && errors.reportIdentifier}
        />
      </div>
      <div className={styles.datePickerWrapper}>
        <div className={classNames(styles.formField, { [styles.error]: Boolean(errors.reportDate) })}>
          <Typography variant='body2' className={styles.formLabel}>Report Date <span>*</span></Typography>
          <p id='datepicker-instructions' style={visuallyHidden}>Use arrow keys to select a date.</p>
          <DatePicker
            selected={reportDate}
            onChange={handleDatePickerChange}
            onBlur={() => handleBlur('reportDate')}
            dateFormat='EEE MMM dd yyyy'
            className={styles.datePicker}
            placeholderText='Eg. Thu Jan 02'
            minDate={new Date()}
            onCalendarOpen={handleCalendarOpen}
            customInput={(
              <TextField
                value={reportDate ? format(reportDate, 'EEE MMM dd yyyy') : ''}
                required
                onChange={() => {}}
                onClick={() => {}}
                fullWidth
                inputRef={datePicketInputRef}
              />
            )}
          />
          {touched.reportDate && errors.reportDate && (
            <Typography color='error' variant='caption' className={styles.textFieldError}>
              {errors.reportDate}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepOne;
