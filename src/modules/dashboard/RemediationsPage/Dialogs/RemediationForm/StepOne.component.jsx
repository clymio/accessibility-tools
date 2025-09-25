import { info, minusCircle, plus } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import { useRemediationFormStore } from '@/stores/useRemediationFormStore';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import { useRef } from 'react';
import AceEditor from 'react-ace';
import styles from './RemediationForm.module.scss';

const StepOne = () => {
  const { remediationName, setRemediationName, remediationDescription, setRemediationDescription, examples, handleChange, handleBlur, errors, touched, addExample, removeExample }
    = useRemediationFormStore();

  const addExampleBtnRef = useRef(null);

  const handleAddExample = async () => {
    await addExample();
    const rows = document.querySelectorAll('.fieldSetRow');
    const lastRow = rows[rows.length - 1];
    if (!lastRow) return;
    const el = lastRow.querySelector('input');
    if (!el) return;
    el.focus();
  };

  const handleRemoveExample = async (index) => {
    await removeExample(index);
    if (addExampleBtnRef.current) {
      addExampleBtnRef.current.focus();
    }
  };

  const onEditorLoad = (e) => {
    e.commands.bindKey('Tab', null);
    e.commands.bindKey('Shift-Tab', null);

    const textarea = e.textInput.getElement();
    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Tab') {
        ev.preventDefault();

        const focusable = Array.from(document.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
          el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden') && el.offsetParent !== null
        );

        const active = document.activeElement;
        const index = focusable.indexOf(active);

        if (ev.shiftKey) {
          const prev = focusable[index - 1] || focusable[focusable.length - 1];
          prev.focus();
        } else {
          const next = focusable[index + 1] || focusable[0];
          next.focus();
        }
      }
    });
  };

  return (
    <div className={styles.stepOne}>
      <div className={styles.formField}>
        <TextField
          label='Remediation name'
          placeholder='E.g. Nov 12, 2024 remediation'
          required
          value={remediationName}
          onChange={e => setRemediationName(e.target.value)}
          onBlur={e => handleBlur('remediationName')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.remediationName && Boolean(errors.remediationName)}
          helperText={touched?.remediationName && errors.remediationName}
          autoFocus
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Description</Typography>
                <Tooltip title='Provide a brief description of the remediation.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={remediationDescription ?? ''}
          onChange={e => setRemediationDescription(e.target.value)}
          onBlur={e => handleBlur('remediationDescription', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={4}
          className={styles.textField}
        />
      </div>
      <div className={styles.examples}>
        <Typography variant='body1' sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
          Examples
        </Typography>
        {examples?.map((example, index) => {
          return (
            <div key={index} className={`${styles.fieldSetRow} fieldSetRow`}>
              <div className={styles.formField}>
                <TextField
                  label='Name'
                  required
                  name={`examples[${index}].name`}
                  value={example.name ?? ''}
                  onChange={e => handleChange('name', e.target.value, index)}
                  onBlur={() => handleBlur('name', index)}
                  fullWidth
                  margin='normal'
                  placeholder='Example name'
                  className={styles.textField}
                  error={touched.examples?.[index]?.name && Boolean(errors.examples?.[index]?.name)}
                  helperText={touched.examples?.[index]?.name ? errors.examples?.[index]?.name : ''}
                />
              </div>
              <div className={styles.formField}>
                <TextField
                  label={(
                    <div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                        <Typography variant='body2'>Description</Typography>
                        <Tooltip title='Provide a brief description of the example.'>
                          <span className={styles.infoIcon}>
                            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                          </span>
                        </Tooltip>
                      </span>
                    </div>
                  )}
                  name={`examples[${index}].description`}
                  value={example.description ?? ''}
                  onChange={e => handleChange('description', e.target.value, index)}
                  onBlur={() => handleBlur('description', index)}
                  fullWidth
                  margin='normal'
                  multiline
                  rows={4}
                  className={styles.textField}
                />
              </div>
              <div className={styles.formField}>
                <Typography variant='body2'>Code</Typography>
                <AceEditor
                  width='100%'
                  height='15rem'
                  className={classNames(styles.codeEditor)}
                  ariaLabel='Code example'
                  value={example.code}
                  onChange={e => handleChange('code', e, index)}
                  onLoad={onEditorLoad}
                />
              </div>
              {index !== 0 && (
                <IconButton className={`${styles.deleteButton} deleteButton`} aria-label='Remove example' onClick={() => handleRemoveExample(index)} edge='end'>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.removeIcon)} icon={minusCircle} />
                </IconButton>
              )}
            </div>
          );
        })}
        <Button variant='text' className={styles.addExampleButton} onClick={handleAddExample} ref={addExampleBtnRef}>
          <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
          <Typography variant='body2'>Add additional example</Typography>
        </Button>
      </div>
    </div>
  );
};

export default StepOne;
