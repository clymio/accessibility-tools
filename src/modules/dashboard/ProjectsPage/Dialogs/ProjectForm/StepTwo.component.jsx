import { isDomainValid } from '@/electron/lib/utils';
import Select from '@/modules/core/Select';
import { useProjectFormStore } from '@/stores/useProjectFormStore';
import { info, plus, minusCircle, minus } from '@/assets/icons';
import { Box, Button, Divider, FormControl, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import styles from './ProjectForm.module.scss';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSystemStore } from '@/stores';
import Icon from '@/modules/core/Icon';

const StepTwo = () => {
  const {
    projectId,
    projectName,
    envDomains,
    errors,
    touched,
    setProjectName,
    handleChange,
    handleBlur,
    addEnvDomain,
    removeEnvDomain,
    setEnvDomains,
    technologies,
    setTechnologies,
    essentialFunctionality,
    setEssentialFunctionality,
    webPageTypes,
    setWebPageTypes,
    initialEnvDomains,
    setInitialEnvDomains
  } = useProjectFormStore();
  const { environments } = useSystemStore();

  const addEnvGroupButton = useRef(null);

  const [purposeAndFunctionalityOpen, setPurposeAndFunctionalityOpen] = useState(false);
  const [availableTechnologies, setAvailableTechnologies] = useState([]);

  const readProject = useCallback(async () => {
    if (projectId) {
      const data = await window.api.project.read({ id: projectId });
      setProjectName(data.name || '');
      setTechnologies(data.technologies?.map(tech => tech.id) || []);
      setEssentialFunctionality(data.essential_functionality || '');
      setWebPageTypes(data.webpage_types || '');

      if (data.webpage_types?.length || data.technologies?.length || data.essential_functionality?.length) {
        setPurposeAndFunctionalityOpen(true);
      }
    }
  }, [projectId]);

  const fetchEnvironments = useCallback(async () => {
    const data = await window.api.environment.find({ project_id: projectId });
    const mappedData = data?.result?.map(env => ({
      id: env.id,
      environment: env.name,
      domain: env.url
    })) || [];
    setEnvDomains(mappedData);
    setInitialEnvDomains(mappedData);
  }, [projectId, setEnvDomains]);

  const fetchAvailableTechnologies = async () => {
    try {
      const response = await window.api.technology.find({ limit: false });
      if (response?.result) {
        setAvailableTechnologies(response.result.map(tech => ({
          value: tech.id,
          label: tech.name,
          isSystem: tech.is_system
        })));
      }
    } catch (error) {
      console.error('Error fetching available technologies:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      setPurposeAndFunctionalityOpen(false);
      readProject();
      fetchEnvironments();
      fetchAvailableTechnologies();
    }
  }, [projectId]);

  const environmentOptions = useMemo(() => {
    return environments.map((env) => {
      const value = env.name;
      return {
        value,
        label: value,
        disabled: envDomains.some(domain => domain.environment === value)
      };
    });
  }, [environments, envDomains]);

  const handleDomainBlur = (domain, index) => {
    const { errors, touched, setErrors, setTouched } = useProjectFormStore.getState();

    const domainInvalid = !isDomainValid(domain);

    const updatedErrors = [...errors.envDomains];
    updatedErrors[index] = {
      ...updatedErrors[index],
      domain: domainInvalid ? 'Domain must be a valid URL' : ''
    };

    const updatedTouched = [...touched.envDomains];
    updatedTouched[index] = { ...updatedTouched[index], domain: true };

    setErrors({ ...errors, envDomains: updatedErrors });
    setTouched({ ...touched, envDomains: updatedTouched });
  };

  const togglePurposeAndFunctionality = () => setPurposeAndFunctionalityOpen(prev => !prev);

  const handleOptionsChange = async (newOptions) => {
    const previousTechIds = new Set(technologies);
    const existingTechValues = new Set(availableTechnologies.map(tech => tech.value));
    const newTechs = newOptions.filter(option => !existingTechValues.has(option.value));

    if (newTechs.length > 0) {
      try {
        for (const newTech of newTechs) {
          const createdTech = await window.api.technology.create({ name: newTech.label });

          if (createdTech?.id) {
            newTech.value = createdTech.id;
            newTech.isSystem = false;
          }
        }

        setAvailableTechnologies(prev => [...prev, ...newTechs]);
      } catch (error) {
        console.error('Error creating new technology:', error);
      }
    }

    const newTechIds = newTechs.map(tech => tech.value);

    const removedTechs = availableTechnologies.filter(
      tech => !newOptions.some(option => option.value === tech.value)
    );

    if (removedTechs.length > 0) {
      try {
        for (const removedTech of removedTechs) {
          await window.api.technology.delete({ id: removedTech.value });
        }
      } catch (error) {
        console.error('Error deleting technology:', error);
      }
    }

    const updatedTechnologyIds = [...previousTechIds, ...newTechIds].filter(
      id => !removedTechs.some(tech => tech.value === id)
    );

    setTechnologies(updatedTechnologyIds);
    setAvailableTechnologies(newOptions);
  };

  const allEnvironmentsAssigned = useMemo(() =>
    environments.every(env =>
      envDomains.some(domain => domain.environment === env.name)
    ), [environments, envDomains]);

  const addEnvGroup = async () => {
    await addEnvDomain();
    const rows = document.querySelectorAll('.environmentRow');
    const lastRow = rows[rows.length - 1];
    if (!lastRow) return;
    const el = lastRow.querySelector('[role=\'combobox\']');
    if (!el) return;
    el.focus();
  };

  const removeEnvGroup = async (index) => {
    await removeEnvDomain(index);
    if (addEnvGroupButton.current) {
      addEnvGroupButton.current.focus();
    }
  };

  return (
    <>
      <div>
        <div className={styles.formField}>
          <TextField
            variant='outlined'
            fullWidth
            required
            placeholder='E.g. Company name'
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            onBlur={e => handleBlur('projectName', e.target.value)}
            error={Boolean(touched.projectName && errors.projectName)}
            helperText={touched.projectName && errors.projectName ? 'Project name is required' : ''}
            margin='normal'
            label='Project name'
            className={`${styles.textField} ${touched.projectName && errors.projectName ? styles.textFieldError : ''}`}
            autoFocus
          />
        </div>

        <Typography variant='body1' gutterBottom pt={2}>
          Environments
        </Typography>

        <div className={styles.formField}>
          <div className={styles.environmentSection}>
            {envDomains.map((pair, index) => {
              const isExistingDomain = Boolean(projectId && initialEnvDomains.some(d => d.environment === pair.environment && d.domain === pair.domain));

              return (
                <Box key={index} className={`${styles.environmentRow} environmentRow`}>
                  <Select
                    index={index}
                    value={pair.environment}
                    onChange={value => handleChange('environment', value, index)}
                    onBlur={() => handleBlur('environment', pair.environment, index)}
                    touched={touched.envDomains?.[index]?.environment}
                    errors={errors.envDomains?.[index]?.environment}
                    label='Environment name'
                    options={environmentOptions}
                  />
                  <TextField
                    label='Domain'
                    required
                    value={pair.domain}
                    disabled={isExistingDomain}
                    onChange={e => handleChange('domain', e.target.value, index)}
                    onBlur={() => handleDomainBlur(pair.domain, index)}
                    error={Boolean(errors.envDomains?.[index]?.domain)}
                    helperText={errors.envDomains?.[index]?.domain}
                    fullWidth
                    className={classNames(styles.textField, errors.envDomains?.[index]?.domain ? styles.textFieldError : '')}
                    InputProps={{
                      endAdornment: !isExistingDomain && index !== 0 && (
                        <InputAdornment position='end'>
                          <IconButton aria-label='Remove environment' onClick={() => removeEnvGroup(index)} edge='end'>
                            <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.removeIcon)} icon={minusCircle} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              );
            })}
          </div>
        </div>

        {!allEnvironmentsAssigned && (
          <Button variant='text' className={styles.addEnvironmentButton} onClick={addEnvGroup} ref={addEnvGroupButton}>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
            <Typography variant='body2'>Add another environment</Typography>
          </Button>
        )}

        {projectId && (
          <Button variant='text' className={styles.addPurposeButton} onClick={togglePurposeAndFunctionality}>
            <Typography variant='body2'>Website purpose and functionality</Typography>
            {purposeAndFunctionalityOpen ? <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={minus} /> : <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />}
          </Button>
        )}
      </div>
      {purposeAndFunctionalityOpen && (
        <div className={styles.purposeAndFunctionalitySection}>
          <FormControl className={styles.formField}>
            <Select
              index={0}
              value={technologies}
              onChange={setTechnologies}
              options={availableTechnologies}
              onOptionsChange={handleOptionsChange}
              label='Web technologies relied upon'
              placeHolder='Select technologies'
              multiple
              allowCustomInput
            />
          </FormControl>
          <Divider></Divider>
          <Typography variant='body1' sx={{ mt: 2, fontWeight: 700 }}>
            Exploration notes
          </Typography>
          <div className={styles.formField}>
            <TextField
              label={(
                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '20px', top: '-20px' }}>
                    <Typography variant='body2'>Essential functionality of the website</Typography>
                    <Tooltip
                      title={(
                        <Typography variant='caption' className={styles.captionLink}>
                          You can use this field to take notes about essential functionality of the website. Examples of essential functionality include: ‘selecting and purchasing
                          a product from the shop area of the website’ ‘completing and submitting a form provided on the website’ ‘registering for an account on the website’ For
                          more information, see
                          <a href='https://www.w3.org/TR/WCAG-EM/#step2b' target='_blank' className={styles.captionLinkText}>
                            WCAG-EM Step 2.b: Identify Essential Functionality of the Website.
                          </a>
                        </Typography>
                      )}
                    >
                      <span className={styles.infoIcon}>
                        <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                      </span>
                    </Tooltip>
                  </span>
                </div>
              )}
              value={essentialFunctionality}
              onChange={e => setEssentialFunctionality(e.target.value)}
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
                  <Typography variant='body2'>Variety of web page types</Typography>
                  <Tooltip
                    title={(
                      <Typography variant='caption' className={styles.captionLink}>
                        You can use this field to take notes about the types of web pages and web states.
                        <a href='https://www.w3.org/TR/WCAG-EM/#step2c' target='_blank' className={styles.captionLinkText}>
                          Types
                        </a>
                      </Typography>
                    )}
                  >
                    <span className={styles.infoIcon}>
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={info} />
                    </span>
                  </Tooltip>
                </span>
              )}
              value={webPageTypes}
              onChange={e => setWebPageTypes(e.target.value)}
              onBlur={e => handleBlur('webPageTypes', e.target.value)}
              fullWidth
              margin='normal'
              multiline
              rows={4}
              className={styles.textField}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StepTwo;
