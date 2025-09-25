import { Button, TextField, Typography } from '@mui/material';
import styles from './ProjectForm.module.scss';

const LogIn = ({ logInStep, onDomainChange, onEmailChange, onCodeChange, domain, email, code, emailError, domainError }) => {
  return (
    <div className={styles.formField}>
      {logInStep === 1
        ? (
          <div className={styles.formFieldSet}>
            <Typography variant='h6'>Please provide your email.</Typography>
            <Typography>We will send a code to log in.</Typography>
            <TextField
              fullWidth
              label='Domain'
              value={domain}
              onChange={e => onDomainChange(e.target.value)}
              error={domainError}
              helperText={domainError ? 'Please enter a valid domain' : ''}
              margin='normal'
              className={`${styles.textField} ${domainError ? styles.textFieldError : ''}`}
            />
            <TextField
              fullWidth
              label='Email Address'
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              error={emailError}
              helperText={emailError ? 'Please enter a valid email address' : ''}
              margin='normal'
              className={`${styles.textField} ${emailError ? styles.textFieldError : ''}`}
            />
          </div>
          )
        : (
          <div className={styles.formFieldSet}>
            <Typography variant='h6'>Please check your email.</Typography>
            <Typography>We've sent a verification code to {email}</Typography>
            <TextField
              fullWidth
              label='Verification Code'
              value={code}
              onChange={e => onCodeChange(e.target.value)}
              inputProps={{ maxLength: 4 }}
              margin='normal'
              className={styles.textField}
            />
            <Typography>Didn’t get a code?<Button variant='text'>Click to resend.</Button></Typography>
          </div>
          )}
    </div>
  );
};

export default LogIn;
