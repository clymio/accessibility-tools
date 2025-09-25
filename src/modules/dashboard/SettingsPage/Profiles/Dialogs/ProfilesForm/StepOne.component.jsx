import ImageUploader from '@/modules/core/ImageUploader';
import Select from '@/modules/core/Select';
import { useSystemStore } from '@/stores';
import { useProfileFormStore } from '@/stores/useProfileFormStore';
import { FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './ProfilesForm.module.scss';

const StepTwo = () => {
  const {
    image,
    setImage,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    title,
    setTitle,
    isOrganization,
    setIsOrganization,
    organization,
    setOrganization,
    errors,
    touched,
    handleBlur
  } = useProfileFormStore();

  const { countries } = useSystemStore();

  const [stateOptions, setStateOptions] = useState([]);
  const [profileUploaderKey, setProfileUploaderKey] = useState(0);
  const [logoUploaderKey, setLogoUploaderKey] = useState(0);

  useEffect(() => {
    if (organization.country) {
      onCountryUpdate(organization.country);
    }
  }, [organization.country]);

  const countryOptions = [...countries]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(country => ({
      value: country.id,
      label: country.name
    }));

  const onCountryUpdate = (selectedCountryId) => {
    const selectedCountry = countries.find(country => country.id === selectedCountryId);
    setOrganization({ ...organization, country: selectedCountryId, state: '' });
    if (selectedCountry?.states.length) {
      setStateOptions(
        selectedCountry.states.map(state => ({
          value: state.id,
          label: state.name
        }))
      );
      setOrganization({ ...organization, country: selectedCountryId, state: organization.state ? organization.state : selectedCountry.states[0].id });
    } else {
      setStateOptions([]);
    }
  };

  const handleImageUpload = (file, type) => {
    if (file) {
      if (type === 'profile') {
        setImage(file);
      } else if (type === 'logo') {
        setOrganization({ ...organization, logo: file });
      }
    } else {
      if (type === 'profile') {
        setImage(null);
        setProfileUploaderKey(prev => prev + 1);
      } else if (type === 'logo') {
        setOrganization({ ...organization, logo: null });
        setLogoUploaderKey(prev => prev + 1);
      }
    }
  };

  return (
    <div className={styles.stepTwo}>
      <div className={styles.formField}>
        <label>
          <Typography variant='body2' sx={{ fontWeight: 500, marginBottom: 1 }}>
            Profile picture
          </Typography>
        </label>
        <ImageUploader
          key={profileUploaderKey}
          id='profile'
          onDrop={img => handleImageUpload(img, 'profile')}
          image={image}
          maxDimensions={[400, 400]}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='First name'
          placeholder='E.g. Anna'
          required
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          onBlur={e => handleBlur('firstName')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.firstName && Boolean(errors.firstName)}
          helperText={touched?.firstName && errors.firstName}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Last name'
          placeholder='E.g. Smith'
          required
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          onBlur={e => handleBlur('lastName')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.lastName && Boolean(errors.lastName)}
          helperText={touched?.lastName && errors.lastName}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label='Title'
          placeholder='E.g. Chief technology officer'
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={e => handleBlur('title')}
          fullWidth
          margin='normal'
          className={styles.textField}
          error={touched?.title && Boolean(errors.title)}
          helperText={touched?.title && errors.title}
        />
      </div>
      <FormControlLabel
        value='end'
        control={<Switch value={isOrganization} checked={isOrganization} onChange={e => setIsOrganization(e.target.checked)} color='primary' />}
        className={styles.organizationToggle}
        label='I represent a testing/auditing organization'
        labelPlacement='start'
      />

      {isOrganization && (
        <>
          <div className={styles.formField}>
            <label>
              <Typography variant='body2' sx={{ fontWeight: 500, marginBottom: 1 }}>
                Logotype
              </Typography>
            </label>
            <ImageUploader key={logoUploaderKey} id='logo' onDrop={img => handleImageUpload(img, 'logo')} image={organization.logo} maxDimensions={[800, 400]} />
          </div>
          <div className={styles.formField}>
            <TextField
              label='Organization name'
              required
              value={organization.name}
              onChange={e => setOrganization({ name: e.target.value })}
              onBlur={e => handleBlur('organization.name')}
              fullWidth
              margin='normal'
              className={styles.textField}
              error={touched?.organization?.name && Boolean(errors.organization?.name)}
              helperText={touched?.organization?.name && errors.organization?.name}
            />
          </div>
          <div className={styles.formField}>
            <TextField
              label='Email'
              required
              type='email'
              value={organization.email}
              onChange={e => setOrganization({ email: e.target.value })}
              onBlur={e => handleBlur('organization.email')}
              fullWidth
              margin='normal'
              className={styles.textField}
              error={touched?.organization?.email && Boolean(errors.organization?.email)}
              helperText={touched?.organization?.email && errors.organization?.email}
            />
          </div>
          <div className={styles.formField}>
            <TextField
              label='Phone number'
              type='number'
              value={organization.phone}
              onChange={e => setOrganization({ phone: e.target.value })}
              onBlur={e => handleBlur('organization.phone')}
              fullWidth
              margin='normal'
              className={styles.textField}
            />
          </div>
          <div className={styles.formField}>
            <TextField
              label='Address'
              value={organization.address}
              onChange={e => setOrganization({ address: e.target.value })}
              onBlur={e => handleBlur('organization.address')}
              fullWidth
              margin='normal'
              className={styles.textField}
            />
          </div>
          <div className={styles.formField}>
            <TextField
              label='Address line 2 (optional)'
              value={organization.address_2}
              onChange={e => setOrganization({ address_2: e.target.value })}
              onBlur={e => handleBlur('organization.address_2')}
              fullWidth
              margin='normal'
              className={styles.textField}
            />
          </div>
          <div className={styles.formField}>
            <TextField
              label='City'
              value={organization.city}
              onChange={e => setOrganization({ city: e.target.value })}
              onBlur={e => handleBlur('organization.city')}
              fullWidth
              margin='normal'
              className={styles.textField}
            />
          </div>
          <div className={styles.cityZip}>
            <div className={classNames(styles.formField, styles.formFieldZip)}>
              <TextField
                label='Zip code'
                value={organization.zip_code}
                onChange={e => setOrganization({ zip_code: e.target.value })}
                onBlur={e => handleBlur('organization.zip_code')}
                fullWidth
                margin='normal'
                className={styles.textField}
              />
            </div>
            <div className={classNames(styles.formField, styles.formFieldState)}>
              <Select label='State' value={organization.state} onChange={e => setOrganization({ state: e })} options={stateOptions} />
            </div>
          </div>

          <div className={classNames(styles.formField, styles.formFieldCountry)}>
            <Select label='Country' value={organization.country} onChange={e => onCountryUpdate(e)} options={countryOptions} />
          </div>
          <div className={styles.formField}>
            <TextField
              label='Website'
              value={organization.url}
              onChange={e => setOrganization({ url: e.target.value })}
              onBlur={e => handleBlur('organization.url')}
              fullWidth
              margin='normal'
              className={styles.textField}
              error={touched?.organization?.url && Boolean(errors.organization?.url)}
              helperText={touched?.organization?.url && errors.organization?.url}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StepTwo;
