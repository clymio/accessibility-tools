'use strict';
import styles from './Accordion.module.scss';
import classNames from 'classnames';

export default function AccordionAction({
  onClick,
  label
}) {
  return <span onClick={onClick} className={classNames(styles.action, {})}>{label}</span>;
}
