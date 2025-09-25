import { useAuditFormStore } from '@/stores/useAuditFormStore';
import styles from './AuditForm.module.scss';
import Select from '@/modules/core/Select';
import { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { circlePlus } from '@/assets/icons'; import Icon from '@/modules/core/Icon';
import StartTest from '@/modules/dashboard/ProjectsPage/Dialogs/ProjectTest/StartTest.component';
import classNames from 'classnames';

const StepThree = () => {
  const {
    auditId,
    project,
    setProject,
    environmentType,
    setEnvironmentType,
    test,
    setTest,
    product,
    setProduct,
    vendor,
    setVendor,
    handleBlur,
    touched,
    errors
  } = useAuditFormStore();

  const [projectOptions, setProjectOptions] = useState([]);
  const [environmentOptions, setEnvironmentOptions] = useState([]);
  const [testOptions, setTestOptions] = useState([]);
  const [isTestFormOpen, setTestFormOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await window.api.project.find();
      const options = data?.result?.map(item => ({
        value: item.id,
        label: item.name
      }));

      setProjectOptions(options);

      if (options.length) {
        const initialProject = options[0].value;
        setProject(initialProject);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (project) {
      const fetchEnvironments = async () => {
        const data = await window.api.environment.find({ project_id: project });
        const mappedData = data?.result?.map(env => ({
          value: env.id,
          label: env.name
        })) || [];

        setEnvironmentOptions(mappedData);
        setEnvironmentType(mappedData[0]?.value || '');
      };

      fetchEnvironments();
    }
  }, [project]);

  useEffect(() => {
    if (project && environmentType) {
      fetchTests();
    }
  }, [project, environmentType]);

  const fetchTests = async () => {
    const data = await window.api.environmentTest.find({
      project_id: project,
      environment_id: environmentType
    });

    const mappedData = data?.result?.map(test => ({
      value: test.id,
      label: test.name
    })) || [];

    setTestOptions(mappedData);
    setTest(mappedData[0]?.value || '');
  };

  const toggleTestForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTestFormOpen(!isTestFormOpen);
  };

  const handleTestAdd = () => {
    fetchTests();
  };

  return (
    <div className={styles.stepTwo}>
      <div className={styles.formField}>
        {projectOptions.length > 0 && <Select label='Project' value={project} onChange={setProject} touched={touched.project} errors={errors.project} disabled={!!auditId} options={projectOptions} />}
      </div>
      <div className={styles.formField}>
        {environmentOptions.length > 0 && (
          <Select
            value={environmentType}
            onChange={setEnvironmentType}
            onBlur={() => handleBlur('environmentType', environmentType)}
            touched={touched.environmentType}
            errors={errors.environmentType}
            label='Environment type'
            disabled={!!auditId}
            options={environmentOptions}
          />
        )}
      </div>
      <div className={styles.formField}>
        {testOptions.length > 0
          ? (
            <Select value={test} onChange={setTest} onBlur={() => handleBlur('test', test)} touched={touched.test} errors={errors.test} label='Test' disabled={!!auditId} options={testOptions} />
            )
          : (
            <div className={styles.addTest}>
              <Typography>No tests exist for this project in this environment. Add one or choose a different environment.</Typography>
              <Button onClick={toggleTestForm}>
                Add test <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
              </Button>
              <StartTest open={isTestFormOpen} onClose={e => toggleTestForm(e)} project={project} onTestStarted={handleTestAdd} />
            </div>
            )}
      </div>
      <Typography variant='body1' sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
        Product information
      </Typography>
      <div className={styles.formField}>
        <TextField
          label='Name'
          value={product.name}
          onChange={e => setProduct({ name: e.target.value })}
          onBlur={() => handleBlur('product.name')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.product?.name && Boolean(errors.product?.name)}
          helperText={touched?.product?.name && errors.product?.name}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Version'
          value={product.version}
          onChange={e => setProduct({ version: e.target.value })}
          onBlur={() => handleBlur('product.version')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.product?.version && Boolean(errors.product?.version)}
          helperText={touched?.product?.version && errors.product?.version}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Description'
          value={product.description}
          onChange={e => setProduct({ description: e.target.value })}
          onBlur={() => handleBlur('product.description')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.product?.description && Boolean(errors.product?.description)}
          helperText={touched?.product?.description && errors.product?.description}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Website (URL)'
          value={product.website}
          onChange={e => setProduct({ website: e.target.value })}
          onBlur={() => handleBlur('product.website')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.product?.website && Boolean(errors.product?.website)}
          helperText={touched?.product?.website && errors.product?.website}
        />
      </div>
      <Typography variant='body1' sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
        Vendor information
      </Typography>
      <div className={styles.formField}>
        <TextField
          label='Vendor (company) name'
          value={vendor.name}
          onChange={e => setVendor({ name: e.target.value })}
          onBlur={() => handleBlur('vendor.name')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.vendor?.name && Boolean(errors.vendor?.name)}
          helperText={touched?.vendor?.name && errors.vendor?.name}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Address'
          value={vendor.address}
          onChange={e => setVendor({ address: e.target.value })}
          onBlur={() => handleBlur('vendor.address')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.vendor?.address && Boolean(errors.vendor?.address)}
          helperText={touched?.vendor?.address && errors.vendor?.address}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Website (URL)'
          value={vendor.website}
          onChange={e => setVendor({ website: e.target.value })}
          onBlur={() => handleBlur('vendor.website')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.vendor?.website && Boolean(errors.vendor?.website)}
          helperText={touched?.vendor?.website && errors.vendor?.website}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Contact name'
          value={vendor.contactName}
          onChange={e => setVendor({ contactName: e.target.value })}
          onBlur={() => handleBlur('vendor.contactName')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.vendor?.contactName && Boolean(errors.vendor?.contactName)}
          helperText={touched?.vendor?.contactName && errors.vendor?.contactName}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Contact email'
          value={vendor.contactEmail}
          onChange={e => setVendor({ contactEmail: e.target.value })}
          onBlur={() => handleBlur('vendor.contactEmail')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.vendor?.contactEmail && Boolean(errors.vendor?.contactEmail)}
          helperText={touched?.vendor?.contactEmail && errors.vendor?.contactEmail}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Contact phone'
          value={vendor.contactPhone}
          onChange={e => setVendor({ contactPhone: e.target.value })}
          onBlur={() => handleBlur('vendor.contactPhone')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.vendor?.contactPhone && Boolean(errors.vendor?.contactPhone)}
          helperText={touched?.vendor?.contactPhone && errors.vendor?.contactPhone}
        />
      </div>
    </div>
  );
};

export default StepThree;
