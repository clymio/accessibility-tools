import { chevronDown, plus, search, toolbox2, trash2 } from '@/assets/icons';
import Dialog from '@/modules/core/Dialog';
import Icon from '@/modules/core/Icon';
import { useSnackbarStore } from '@/stores';
import { Autocomplete, Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ManageRemediations.module.scss';

export default function ManageRemediations({ open, onClose, testCaseId }) {
  const { openSnackbar } = useSnackbarStore();

  const [testCaseRemediations, setTestCaseRemediations] = useState([]);
  const [remediations, setRemediations] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  let newRemediationId = useRef(0);
  const addRemediationBtnRef = useRef(null);

  const fetchTestCaseRemediations = useCallback(async () => {
    try {
      const testCase = await window.api.testCase.find({ id: testCaseId });

      const testCaseRemediations
        = testCase.remediations?.map(r => ({
          id: r.id,
          value: r.id,
          label: r.name,
          description: r.description
        })) ?? [];

      const hasValidRemediations = testCaseRemediations.some(r => !!r.value);

      setTestCaseRemediations(hasValidRemediations ? testCaseRemediations : [{ id: 0, value: '', label: '', description: '' }]);
      newRemediationId.current = testCaseRemediations.length;

      const remediationData = await window.api.remediation.find({ selectors: testCase.selectors.split('\n'), limit: false });
      setRemediations(
        remediationData.result.map(r => ({
          value: r.id,
          label: r.name,
          description: r.description
        }))
      );
    } catch (err) {
      console.log(err);
    }
  }, [testCaseId]);

  useEffect(() => {
    if (open) {
      fetchTestCaseRemediations();
    }
  }, [open, fetchTestCaseRemediations]);

  const addRemediation = async () => {
    if (newRemediationId.current === 0) {
      newRemediationId.current++;
    }
    setTestCaseRemediations(prev => [...prev, { id: newRemediationId.current++, value: '', label: '', description: '' }]);
  };

  const addRemediationHandler = async () => {
    await addRemediation();
    const rows = document.querySelectorAll('.autocompleteRow');
    const lastRow = rows[rows.length - 1];
    if (!lastRow) return;
    const el = lastRow.querySelector('input');
    if (!el) return;
    el.focus();
  };

  const removeRemediation = (i) => {
    setTestCaseRemediations(prev => prev.filter((_, index) => index !== i));
    if (addRemediationBtnRef.current) {
      addRemediationBtnRef.current.focus();
    }
  };

  const handleChange = (remediationId, newValue) => {
    setTestCaseRemediations(prev => prev.map(r => (r.id === remediationId ? { ...r, value: newValue?.value || '', label: newValue?.label || '' } : r)));
  };

  const handleBlur = (remediationId) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      const remediation = testCaseRemediations.find(r => r.id === remediationId);
      if (!remediation?.value) {
        newErrors[remediationId] = 'Please select a remediation';
      } else {
        delete newErrors[remediationId];
      }
      return newErrors;
    });
  };

  const handleDropdownOpen = (index) => {
    setOpenDropdownIndex(index);
  };

  const handleDropdownClose = () => {
    setOpenDropdownIndex(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newErrors = {};
    testCaseRemediations.forEach((r) => {
      if (!r.value) {
        newErrors[r.id] = 'Please select a remediation';
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      openSnackbar({ message: 'Please resolve errors before saving.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await window.api.testCase.update({ id: testCaseId, remediations: testCaseRemediations.map(r => r.value) });
      onClose();
    } catch (err) {
      openSnackbar({ message: 'Failed to update remediations.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRemediations = remediations.filter(r => !testCaseRemediations.some(selected => selected.value === r.value));

  const selectedValues = new Set(testCaseRemediations.map(r => r.value));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title='Manage remediations'
      titleIcon={<Icon icon={toolbox2} className={styles.icon} showShadow={true} />}
      dialogHeaderClassName={styles.dialogHeader}
      dialogContentClassName={styles.dialogContent}
      dialogActionsClassName={styles.dialogActions}
      dialogContainerClassName={styles.dialogContainer}
      onSubmit={handleSubmit}
      actionsConfig={{
        nextLabel: 'Save',
        backLabel: 'Cancel',
        isSubmitting,
        onBack: onClose
      }}
      className={styles.dialogContentContainer}
      classes={{
        container: styles.dialogContainer,
        muiSvgIcon: styles.icon
      }}
      PaperProps={{
        style: {
          minHeight: '40%',
          maxHeight: '80%',
          minWidth: '660px',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px',
          overflow: 'auto',
          padding: 0
        }
      }}
    >
      <div>
        <Typography variant='body1' gutterBottom pt={5} mb={1}>
          Remediation
        </Typography>
        {testCaseRemediations.map((remediation, index) => (
          <Box key={index} className={classNames(styles.autocompleteRow, 'autocompleteRow')}>
            <Autocomplete
              className={styles.autocomplete}
              disablePortal
              options={remediations.filter(r => !selectedValues.has(r.value))}
              fullWidth
              autoHighlight
              handleHomeEndKeys
              selectOnFocus
              clearOnBlur
              open={openDropdownIndex === index}
              onOpen={() => handleDropdownOpen(index)}
              onMouseDown={e => e.preventDefault()}
              onClose={handleDropdownClose}
              onChange={(_, newValue) => handleChange(remediation.id, newValue)}
              onBlur={() => handleBlur(remediation.id)}
              value={remediations.find(r => r.value === remediation.value) || null}
              getOptionLabel={option => (option ? `${option?.value} ${option?.label}` : '')}
              noOptionsText='No remediations match your search'
              renderOption={(props, option) => {
                const key = `${option.value}-${index}`;
                return (
                  <li {...props} key={key}>
                    <Typography
                      variant='body2'
                      className={styles.optionItem}
                      style={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {option.value} <span> {option.label}</span>
                    </Typography>
                  </li>
                );
              }}
              renderInput={(params) => {
                const isOpen = openDropdownIndex === index;
                const hasValue = !!params.inputProps.value;

                return (
                  <Box paddingX='8px'>
                    <TextField
                      {...params}
                      sx={{ margin: 0 }}
                      className={styles.textField}
                      variant='outlined'
                      placeholder='Select remediation'
                      error={!!errors[remediation.id]}
                      helperText={errors[remediation.id]}
                      autoFocus
                      InputProps={{
                        ...params.InputProps,
                        startAdornment:
                          isOpen && !hasValue
                            ? (
                              <InputAdornment position='start'>
                                <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={search} />
                              </InputAdornment>
                              )
                            : null,
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Icon
                              className={classNames(styles.inputArrow, styles.icon, isOpen ? styles.inputArrowOpen : '')}
                              icon={chevronDown}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onMouseUp={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openDropdownIndex === index ? handleDropdownClose() : handleDropdownOpen(index);
                              }}
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                );
              }}
            />

            {index > 0 && (
              <IconButton onClick={() => removeRemediation(index)} aria-label='Remove remediation' className={styles.deleteButton}>
                <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={trash2} />
              </IconButton>
            )}
          </Box>
        ))}
        {availableRemediations.length > 0 && testCaseRemediations.length <= remediations.length - 1 && (
          <Button variant='text' className={styles.addRemediationButton} onClick={addRemediationHandler} ref={addRemediationBtnRef}>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
            <Typography variant='body2'>Add another remediation</Typography>
          </Button>
        )}
      </div>
    </Dialog>
  );
}
