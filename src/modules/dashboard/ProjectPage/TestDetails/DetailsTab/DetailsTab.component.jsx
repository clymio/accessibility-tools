import { TERMINAL_SECTIONS } from '@/constants/terminal';
import Select from '@/modules/core/Select';
import TestCaseInfo from '@/modules/dashboard/TestCasesPage/TestCaseInfo.component';
import { useProjectStore, useTerminalStore } from '@/stores';
import { useTestDetailsStore } from '@/stores/useTestDetailsStore';
import { Box, Button, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import style from '../TestDetails.module.scss';

const TestDetailsTab = ({ onFormSubmit = () => {} }) => {
  const { formSaved, status, notes, remediation, remediationOptions, setFormSaved, setNotes, setRemediation, handleFormSubmit, handleStatusChange } = useTestDetailsStore();
  const { getTestStats } = useProjectStore();
  const { clickedTargetContext } = useTerminalStore();

  const currentTargetNode = clickedTargetContext.curr;
  const isRemediationDrawer = clickedTargetContext.section === TERMINAL_SECTIONS.REMEDIATIONS;
  const testCase = currentTargetNode?.test.test_case;

  const handleRemediationSelect = (value) => {
    setRemediation(value);
  };

  const handleFormSave = async () => {
    await handleFormSubmit();
    setFormSaved(true);
    onFormSubmit();
  };

  const onStatusChange = (val) => {
    const currentTargetNode = clickedTargetContext.curr;
    if (!currentTargetNode) return;
    handleStatusChange(val);
    getTestStats(currentTargetNode.test.environment_test_id);
  };

  return (
    <Box className={style.detailsTabWrapper}>
      <Box className={style.contentWrapper}>
        <TestCaseInfo testCase={testCase} />
        {currentTargetNode.parent_landmark && currentTargetNode.parent_landmark.html && !isRemediationDrawer && (
          <Box className={style.codeWrapper}>
            <Typography className={style.codeLabel}>Landmark</Typography>
            <pre>
              <code>{currentTargetNode.parent_landmark.html}</code>
            </pre>
          </Box>
        )}
        <Box className={style.codeWrapper}>
          <Typography className={style.codeLabel}>Selector</Typography>
          <pre>
            <code>{currentTargetNode.selector}</code>
          </pre>
        </Box>
        <Box className={style.codeWrapper}>
          <Typography className={style.codeLabel}>HTML</Typography>
          <pre>
            <code>{currentTargetNode.html}</code>
          </pre>
        </Box>
      </Box>
      {(status === 'INCOMPLETE' || status === 'FAIL' || status === 'MANUAL') && (
        <Box className={classNames(style.formWrapper, { [style.open]: status === 'INCOMPLETE' || status === 'MANUAL' || (status === 'FAIL' && !formSaved) })}>
          {(status === 'INCOMPLETE' || status === 'MANUAL') && (
            <Box className={style.buttonWrapper}>
              <Button className={classNames(style.fullWidth, style.cancel)} variant='contained' color='secondary' onClick={() => onStatusChange('FAIL')}>
                <Typography variant='body2'>Failed</Typography>
              </Button>
              <Button className={style.fullWidth} variant='contained' onClick={() => onStatusChange('PASS')}>
                <Typography>Passed</Typography>
              </Button>
            </Box>
          )}
          {status === 'FAIL' && !formSaved && (
            <>
              <div className={style.formField}>
                <TextField
                  label={<Typography>Add notes</Typography>}
                  value={notes || ''}
                  onChange={e => setNotes(e.target.value)}
                  fullWidth
                  margin='normal'
                  multiline
                  rows={4}
                  className={style.textField}
                />
              </div>
              {remediationOptions.length > 0 && (
                <Box className={style.formField} sx={{ mb: 2 }}>
                  <Select
                    label='Remediation'
                    options={remediationOptions}
                    value={remediation}
                    onChange={handleRemediationSelect}
                    selectClassName={style.remediationSelect}
                  >
                  </Select>
                </Box>
              )}
              <Box className={style.buttonWrapper}>
                <Button className={style.cancel} variant='contained' onClick={() => onStatusChange('INCOMPLETE')}>
                  <Typography>Cancel</Typography>
                </Button>
                <Button variant='contained' onClick={handleFormSave}>
                  <Typography>Save</Typography>
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TestDetailsTab;
