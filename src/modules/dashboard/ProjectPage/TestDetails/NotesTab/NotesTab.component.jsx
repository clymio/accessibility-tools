import { useTestDetailsStore } from '@/stores/useTestDetailsStore';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import style from '@/modules/dashboard/ProjectPage/TestDetails/TestDetails.module.scss';
import { useState } from 'react';
import classNames from 'classnames';
import { edit2 } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

const NotesTab = ({ editNotes = false, setEditNotes = () => {} }) => {
  const {
    notes,
    setNotes,
    handleFormSubmit
  } = useTestDetailsStore();

  const [draftNotes, setDraftNotes] = useState(notes ?? '');

  const handleNoteSave = async () => {
    setNotes(draftNotes);
    setEditNotes(false);
    await handleFormSubmit();
  };

  const handleCancel = () => {
    setDraftNotes(notes ?? '');
    setEditNotes(false);
  };

  return (
    <Box className={style.tabWrapper}>
      {editNotes || !notes?.length
        ? (
          <Box className={style.tabForm}>
            <div className={style.formField}>
              <TextField
                label='Notes'
                value={draftNotes}
                onChange={e => setDraftNotes(e.target.value)}
                fullWidth
                margin='normal'
                multiline
                rows={4}
                className={style.textField}
              />
            </div>
            <Box className={style.buttonWrapper}>
              <Button className={style.cancel} variant='contained' onClick={handleCancel}>
                <Typography>Cancel</Typography>
              </Button>
              <Button
                variant='contained'
                onClick={handleNoteSave}
              >
                <Typography>Save</Typography>
              </Button>
            </Box>
          </Box>
          )
        : (
          <Box className={style.title}>
            <Typography>
              {notes}
            </Typography>
            <IconButton size='lg' color='primary' onClick={() => setEditNotes(true)}>
              <Icon className={classNames('clym-contrast-exclude', style.icon, style.editIcon)} icon={edit2} />
            </IconButton>
          </Box>
          )}
    </Box>
  );
};

export default NotesTab;
