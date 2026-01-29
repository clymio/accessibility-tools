import { edit2 } from '@/assets/icons';
import { TERMINAL_SECTIONS } from '@/constants/terminal';
import Icon from '@/modules/core/Icon';
import Select from '@/modules/core/Select';
import style from '@/modules/dashboard/ProjectPage/TestDetails/TestDetails.module.scss';
import RemediationInfo from '@/modules/dashboard/RemediationsPage/RemediationInfo.component';
import { useTerminalStore } from '@/stores';
import { useTestDetailsStore } from '@/stores/useTestDetailsStore';
import { Box, Button, IconButton, Typography } from '@mui/material';
import classNames from 'classnames';

const RemediationsTab = ({ editRemediation = false, setEditRemediation = () => {} }) => {
  const { remediation, remediationOptions, setRemediation, handleFormSubmit } = useTestDetailsStore();

  const { clickedTargetContext } = useTerminalStore();

  const currentTargetNode = clickedTargetContext.curr;
  const testCase = currentTargetNode?.test.test_case;
  const selectedRemediation = testCase?.remediations.find(r => r.id === remediation);

  const handleRemediationSave = async () => {
    setEditRemediation(false);
    await handleFormSubmit();
  };

  const isRemediationDrawer = clickedTargetContext.section === TERMINAL_SECTIONS.REMEDIATIONS;

  if (!selectedRemediation) return null;

  return (
    <Box className={style.tabWrapper}>
      {editRemediation
        ? (
          <Box className={style.tabForm}>
            <Box className={style.formField}>
              <Select label='Remediation' options={remediationOptions} value={remediation} onChange={setRemediation} />
            </Box>
            <Box className={style.buttonWrapper}>
              <Button className={style.cancel} variant='contained' onClick={() => setEditRemediation(false)}>
                <Typography>Cancel</Typography>
              </Button>
              <Button variant='contained' onClick={handleRemediationSave}>
                <Typography>Save</Typography>
              </Button>
            </Box>
          </Box>
          )
        : (
          <>
            {!isRemediationDrawer && (
              <Box className={style.title}>
                <Typography>
                  <span>{selectedRemediation.id}</span> | {selectedRemediation.name}
                </Typography>
                <IconButton size='lg' color='primary' onClick={() => setEditRemediation(true)}>
                  <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={edit2} />
                </IconButton>
              </Box>
            )}
            <RemediationInfo remediation={selectedRemediation} isDrawer={isRemediationDrawer} />
            {currentTargetNode.parent_landmark && currentTargetNode.parent_landmark.html && isRemediationDrawer && (
              <Box className={style.codeWrapper}>
                <Typography className={style.codeLabel}>Landmark</Typography>
                <pre>
                  <code>{currentTargetNode.parent_landmark.html}</code>
                </pre>
              </Box>
            )}
          </>
          )}
    </Box>
  );
};

export default RemediationsTab;
