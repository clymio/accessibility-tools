import classNames from 'classnames';
import styles from './ProgressBar.module.scss';

export default function ProgressBar({ totalSteps, currentStep }) {
  return (
    <div className={classNames('clym-contrast-exclude', styles.progressBar)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={classNames(
            'clym-contrast-exclude',
            styles.progressStep,
            index + 1 === currentStep && styles.active,
            index + 1 < currentStep && styles.completed
          )}
        />
      ))}
    </div>
  );
}
