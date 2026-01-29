import { useAuditFormStore } from '@/stores/useAuditFormStore';
import { useEffect, useState } from 'react';
import styles from './AuditForm.module.scss';
import Select from '@/modules/core/Select';
import { Box, Button, TextField, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ProfilesForm from '@/modules/dashboard/SettingsPage/Profiles/Dialogs/ProfilesForm';
import { circlePlus, info } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import classNames from 'classnames';

const StepFour = () => {
  const {
    evaluator,
    setEvaluator,
    evaluation,
    setEvaluation,
    executiveSummary,
    setExecutiveSummary,
    handleBlur,
    touched,
    errors
  } = useAuditFormStore();

  const [evaluatorOptions, setEvaluatorOptions] = useState([]);
  const [isProfileFormOpen, setProfileFormOpen] = useState(false);

  const fetchProfiles = async () => {
    const data = await window.api.profile.find();
    const mappedData = data?.result?.map(p => ({
      value: p.id,
      label: `${p.first_name} ${p.last_name}`
    })) || [];

    setEvaluatorOptions(mappedData);

    if (!evaluator && mappedData.length > 0) {
      setEvaluator(mappedData[0].value);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const toggleProfileForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileFormOpen(!isProfileFormOpen);
  };

  const handleProfileAdd = () => {
    fetchProfiles();
  };

  return (
    <div className={styles.stepThree}>
      <Typography variant='body1' sx={{ mt: 2, fontWeight: 700 }}>
        Evaluator
      </Typography>
      <div className={styles.formField}>
        {evaluatorOptions.length > 0
          ? (
            <Select
              label='Select the main evaluator profile'
              value={evaluator}
              onChange={setEvaluator}
              touched={touched.evaluator}
              errors={errors.evaluator}
              options={evaluatorOptions}
            />
            )
          : (
            <div className={styles.addProfile}>
              <Button onClick={toggleProfileForm}>
                New profile <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
              </Button>
              <ProfilesForm open={isProfileFormOpen} onClose={e => toggleProfileForm(e)} onProfileAdded={handleProfileAdd} />
            </div>
            )}
        {errors.evaluator && (
          <Typography variant='caption' className={styles.textFieldError}>
            {errors.evaluator}
          </Typography>
        )}
      </div>
      <Typography variant='body1' sx={{ mt: 2, fontWeight: 700 }}>
        Evaluation
      </Typography>
      <Box className={styles.formField}>
        <TextField
          label='Notes'
          value={evaluation.notes}
          multiline
          rows={3}
          onChange={e => setEvaluation({ notes: e.target.value })}
          onBlur={() => handleBlur('evaluation.notes')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.evaluation?.notes && Boolean(errors.evaluation?.notes)}
          helperText={touched?.evaluation?.notes && errors.evaluation?.notes}
        />
      </Box>
      <Box className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Evaluation methods used</Typography>
                <Tooltip title='Please describe in detail how this report was created. What tools and processes were used. How many and what type of pages were evaluated, along with anything else which would provide context.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={evaluation.methods}
          onChange={e => setEvaluation({ methods: e.target.value })}
          onBlur={() => handleBlur('evaluation.methods')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.evaluation?.methods && Boolean(errors.evaluation?.methods)}
          helperText={touched?.evaluation?.methods && errors.evaluation?.methods}
        />
      </Box>
      <Box className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Legal disclaimer</Typography>
                <Tooltip title='Optional field for legal disclaimer. Please list license here if it is not released under an open license.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={evaluation.legalDisclaimer}
          onChange={e => setEvaluation({ legalDisclaimer: e.target.value })}
          onBlur={() => handleBlur('evaluation.legalDisclaimer')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.evaluation?.legalDisclaimer && Boolean(errors.evaluation?.legalDisclaimer)}
          helperText={touched?.evaluation?.legalDisclaimer && errors.evaluation?.legalDisclaimer}
        />
      </Box>
      <Box className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Repository</Typography>
                <Tooltip title='URL for the git repository that contains the ACR.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={evaluation.repository}
          onChange={e => setEvaluation({ repository: e.target.value })}
          onBlur={() => handleBlur('evaluation.repository')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.evaluation?.repository && Boolean(errors.evaluation?.repository)}
          helperText={touched?.evaluation?.repository && errors.evaluation?.repository}
        />
      </Box>
      <Box className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Feedback</Typography>
                <Tooltip title='Details about feedback from author.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={evaluation.feedback}
          onChange={e => setEvaluation({ feedback: e.target.value })}
          onBlur={() => handleBlur('evaluation.feedback')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.evaluation?.feedback && Boolean(errors.evaluation?.feedback)}
          helperText={touched?.evaluation?.feedback && errors.evaluation?.feedback}
        />
      </Box>
      <Box className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>License</Typography>
                <Tooltip title='If this is released under an open license.'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={evaluation.license}
          onChange={e => setEvaluation({ license: e.target.value })}
          onBlur={() => handleBlur('evaluation.license')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.evaluation?.license && Boolean(errors.evaluation?.license)}
          helperText={touched?.evaluation?.license && errors.evaluation?.license}
        />
      </Box>
      <Typography variant='body1' sx={{ mt: 2, fontWeight: 700 }}>
        Executive Summary
      </Typography>
      <div className={styles.formField}>
        <TextField
          label={(
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                <Typography variant='body2'>Executive summary</Typography>
                <Tooltip title='This field accepts markdown'>
                  <span className={styles.infoIcon}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                  </span>
                </Tooltip>
              </span>
            </div>
          )}
          value={executiveSummary}
          multiline
          rows={4}
          onChange={e => setExecutiveSummary(e.target.value)}
          onBlur={() => handleBlur('executiveSummary')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.executiveSummary && Boolean(errors.executiveSummary)}
          helperText={touched?.executiveSummary && errors.executiveSummary}
        />
      </div>
    </div>
  );
};

export default StepFour;
