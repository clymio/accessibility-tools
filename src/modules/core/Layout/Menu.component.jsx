'use strict';
import { HEADER_HEIGHT } from '@/constants/app';
import style from './Menu.module.scss';
import MenuItem from './MenuItem.component';

export default function Menu({ items = [] }) {
  return (
    <nav className={style.root} style={{ '--top-margin': `${HEADER_HEIGHT}px` }}>
      <div className={style.container}>
        {items
          .filter(m => !m.footer)
          .map((m, k) => (
            <MenuItem key={k} {...m} />
          ))}
      </div>
      <div className={style.footer}>
        {items
          .filter(m => m.footer)
          .map((m, k) => (
            <MenuItem key={k} {...m} />
          ))}
      </div>
    </nav>
  );
}
