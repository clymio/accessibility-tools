import Menu from '@/modules/core/Menu';
import ProfilesForm from '@/modules/dashboard/SettingsPage/Profiles/Dialogs/ProfilesForm';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import { useAccessibilityStore } from '@/stores';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { circlePlus, globePointer, sliders, link, user, menu } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

export default function Profiles() {
  const router = useRouter();
  const openCreate = router.query.openCreate === 'true';

  const {
    adjustments
  } = useAccessibilityStore();

  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isProfileFormOpen, setProfileFormOpen] = useState(false);
  const [menuState, setMenuState] = useState({ anchorEl: null, profile: null });
  const [loading, setLoading] = useState(true);

  const gridRef = useRef(null);
  const isScaledContent = adjustments.CONTENT_SCALING > 2;

  const actionItems = [
    {
      label: 'Edit profile',
      icon: sliders,
      onClick: () => openEditProfile(menuState.profile)
    }
  ];

  const getProfiles = async () => {
    setSelectedProfileId(null);
    setLoading(true);
    try {
      const ProfilesRes = await window.api.profile.find({}, { detailed: true });
      const { result } = ProfilesRes;
      setProfiles(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfiles();
  }, []);

  useEffect(() => {
    if (openCreate) {
      openProfileForm();
    }
  }, [openCreate]);

  const openProfileForm = () => {
    setProfileFormOpen(true);
  };

  const closeProfileForm = () => {
    setProfileFormOpen(false);
    setTimeout(() => {
      setSelectedProfileId(null);
    }, 1000);
  };

  const openEditProfile = (item) => {
    setSelectedProfileId(item.id);
    setProfileFormOpen(true);
  };

  const handleProfileAdd = () => {
    getProfiles();
  };

  const onMenuClick = (event, profile) => {
    setMenuState({ anchorEl: event.currentTarget, profile });
    event.preventDefault();
    event.stopPropagation();
    return true;
  };

  function onMenuClose() {
    setMenuState({ anchorEl: null, profile: null });
  }

  useEffect(() => {
    if (gridRef.current) {
      const cards = Array.from(gridRef.current.children).map(child =>
        child.querySelector(`.${styles.profileCard}`)
      ).filter(Boolean);
      const maxHeight = Math.max(...cards.map(card => card.offsetHeight));
      cards.forEach((card) => {
        card.style.minHeight = `${maxHeight}px`;
        card.style.height = `${maxHeight}px`;
      });
    }
  }, [profiles]);

  if (loading) {
    return (
      <Box className={styles.noProfiles}>
        <CircularProgress className={styles.progressSpinner} color='inherit' size={80} />
      </Box>
    );
  }

  if (profiles.length === 0) {
    return (
      <Box className={styles.noProfiles}>
        <Typography variant='body2' className={styles.noProfileText}>Please create your user profile</Typography>
        <div className={styles.actionButton}>
          <Button onClick={openProfileForm}>
            <Typography>Add profile</Typography>
            <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
          </Button>
        </div>
        <ProfilesForm open={isProfileFormOpen} onClose={closeProfileForm} onProfileAdded={handleProfileAdd} profileId={selectedProfileId} />
      </Box>
    );
  }

  return (
    <Box className={styles.profiles}>
      <Box className={styles.tabHeader}>
        <Typography variant='h3'>Profiles</Typography>
        <div className={styles.actionButton}>
          {/* TODO Update below when connected profile is available */}
          {(profiles.length < 1 && !loading) && (
            <Button onClick={openProfileForm}>
              <Typography>Add profile</Typography>
              <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={circlePlus} />
            </Button>
          )}
          <ProfilesForm open={isProfileFormOpen} onClose={closeProfileForm} onProfileAdded={handleProfileAdd} profileId={selectedProfileId} />
        </div>
      </Box>
      <Box className={classNames(styles.profilesList)}>
        <Box
          sx={{
            '--top-margin': '238px',
            display: 'grid',
            gridTemplateColumns: {
              md: isScaledContent ? 'repeat(2, minmax(150px, 1fr))' : 'repeat(4, minmax(150px, 1fr))',
              lg: isScaledContent ? 'repeat(2, minmax(150px, 1fr))' : 'repeat(4, minmax(150px, 1fr))',
              xl: isScaledContent ? 'repeat(2, minmax(150px, 1fr))' : 'repeat(4, minmax(150px, 1fr))'
            },
            gap: '16px',
            alignItems: 'strecth',
            gridAutoRows: '1fr'
          }}
          ref={gridRef}
        >
          {profiles && profiles.map((profile, index) => (
            <div key={profile.id} className={styles.profile}>
              <Card variant='outlined' className={classNames('clym-contrast-exclude', styles.profileCard, profile.connected ? styles.connectedCard : '')}>
                <CardContent className={styles.profileCardContent}>
                  <Icon className={classNames('clym-contrast-exclude', styles.profileIcon)} icon={user} />
                  <Typography variant='h6' component='div' className={styles.profileName}>
                    {profile.first_name} {profile.last_name}
                  </Typography>
                  <Typography variant='body2' className={styles.profileTitle}>
                    {profile.title}
                  </Typography>
                  {profile.organization?.logo && (
                    <div className={styles.organizationLogo}>
                      <img src={profile.organization.logo} alt={profile.organization.name} />
                    </div>

                  )}
                </CardContent>
              </Card>
              <div className={styles.profileDetail}>
                <div className={styles.connected}>
                  {profile.connected
                    ? (
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={link} />
                      )
                    : (
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={globePointer} />
                      )}
                  {profile.connectedCompany && (
                    <span>
                      <Typography variant='body1' sx={{ fontWight: 500 }}>{profile.connectedCompany}</Typography>
                    </span>
                  )}
                </div>
                <div className={styles.actionMenu}>
                  <IconButton size='small' aria-label='more' aria-controls='menu-button' aria-haspopup='true' onClick={event => onMenuClick(event, profile)}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={menu} />
                  </IconButton>
                  <Menu anchorEl={menuState.anchorEl} onClose={onMenuClose} items={actionItems} />
                </div>
              </div>
              <ProfilesForm open={isProfileFormOpen} onClose={closeProfileForm} onProfileAdded={handleProfileAdd} profileId={selectedProfileId} />
            </div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
