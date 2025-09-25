import classNames from 'classnames';
import style from './Icon.module.scss';

const Icon = ({ icon: Icon, showShadow = false, shadowSize = 20, className = '' }) => {
  return (
    <Icon className={classNames(style.root, className, { [style.shadow]: showShadow })} style={{ '--shadow-size': `${shadowSize}px` }} />
  );
};
export default Icon;
