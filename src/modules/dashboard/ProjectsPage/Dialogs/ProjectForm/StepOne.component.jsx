import { useProjectFormStore } from '@/stores/useProjectFormStore';
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material';
import Icon from '@/modules/core/Icon/Icon.component';
import styles from './ProjectForm.module.scss';

import { uploadCloud, file, check } from '@/assets/icons';
import classNames from 'classnames';

const StepOne = () => {
  const { connected, setConnected } = useProjectFormStore();

  return (
    <div className={styles.formField}>
      <FormControl component='fieldset' className={styles.formFieldSet}>
        <FormLabel id='project-type-label'>
          <Typography variant='body1' component='span'>
            Select your project
          </Typography>
        </FormLabel>
        <RadioGroup className={styles.radioGroup} aria-labelledby='project-type-label' value={connected} onChange={e => setConnected(e.target.value === 'true')}>
          <FormControlLabel
            value={false}
            control={(
              <Radio
                color='primary'
                className={styles.projectBoxRadioButton}
                tabIndex={-1}
                checkedIcon={
                  <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.projectBoxRadioIconChecked)} icon={check} />
              }
              />
            )}
            label={(
              <Box className={`${styles.projectBox}`} onClick={() => setConnected(false)}>
                <Icon icon={file} shadowSize={12} showShadow={true} />
                <Typography>Local project</Typography>
              </Box>
            )}
            labelPlacement='start'
            className={`${styles.projectBoxLabel} ${connected === false ? styles.selected : ''}`}
            tabIndex={0}
            autoFocus
          />
          <FormControlLabel
            value={true}
            control={(
              <Radio
                color='primary'
                disabled
                className={styles.projectBoxRadioButton}
                checkedIcon={
                  <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.projectBoxRadioIconChecked)} icon={check} />
            }
              />
            )}
            label={(
              <Box className={`${styles.projectBox}`}>
                <Icon icon={uploadCloud} shadowSize={12} showShadow={true} />
                <Typography>Connected project</Typography>
              </Box>
            )}
            labelPlacement='start'
            className={`${styles.projectBoxLabel} ${connected ? styles.selected : ''} ${styles.disabled}`}
            tabIndex={-1}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

export default StepOne;
