'use strict';
import { useUiStore } from '@/stores';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import style from './Cell.module.scss';

export default function UserCell({ user = null, userId, onFind, reverse = false, cover = false, unknown = true, asParagraph = false, margin = 0 }) {
  const { theme } = useUiStore();
  const [info, setInfo] = useState(user);
  const loadInfo = async () => {
    try {
      let r = await onFind({ id: userId });
      if (r instanceof Array) r = r[0];
      if (!r) return;
      setInfo(r);
    } catch (e) {
      //
    }
  };
  useEffect(() => {
    if (!userId || !onFind) return;
    loadInfo();
  }, [userId, onFind]);
  if (!info) return <Fragment />;
  let name = info.name || info.username || '';
  if (!name && info.first_name && info.last_name) {
    name = `${info.first_name} ${info.last_name}`;
  }
  if (asParagraph) {
    let txt = info?.email || '';
    if (!txt) txt = name;
    return <>{txt}</>;
  }
  const ls = {};
  if (margin) ls.margin = margin;
  if (!unknown && name === 'Unknown') name = false;
  const avatarUrl = info.avatar_url || info.icon_url;
  return (
    <div
      className={classNames(style.userCell, {
        [style.reverse]: reverse,
        [style.cover]: cover
      })}
      style={ls}
    >
      <Avatar size='small' src={avatarUrl} className={avatarUrl ? 'avatar-circle' : undefined} alt={name || ''} variant='rounded' />
      <div>
        {!unknown && !name
          ? (
              ''
            )
          : (
            <Typography color={theme.palette.text.secondary} variant='h6'>
              {name || 'Unknown'}
            </Typography>
            )}
        <Typography color={theme.palette.text.secondary} variant={!unknown && !name ? 'h6' : 'body1'}>
          {info.email}
        </Typography>
      </div>
    </div>
  );
}
