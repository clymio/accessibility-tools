import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import styles from './ImageUploader.module.scss';
import { Typography, IconButton, Tooltip } from '@mui/material';
import Icon from '@/modules/core/Icon';
import { upload, xIcon } from '@/assets/icons';
import classNames from 'classnames';

export default function ImageUploader({ id = '', onDrop, image = '', maxDimensions = null }) {
  const [localImage, setLocalImage] = useState(image);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalImage(image);
  }, [image]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'image/*',
    drop: (item, monitor) => {
      const file = monitor.getItem().files[0];
      handleFile(file);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  }));

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const validateAndHandleFile = async (file) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, GIF, and SVG are allowed');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
      if (maxDimensions) {
        const [maxWidth, maxHeight] = maxDimensions;
        if (img.width > maxWidth || img.height > maxHeight) {
          setError(`Image dimensions must not exceed ${maxWidth}x${maxHeight} pixels`);
          return;
        }
      }

      setError('');
      const base64Image = await fileToBase64(file);
      setLocalImage(base64Image);
      onDrop(base64Image);
    };
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validateAndHandleFile(file);
  };

  const handleRemove = () => {
    setLocalImage('');
    onDrop('');
  };

  return (
    <div
      id={id}
      ref={drop}
      className={`${styles.uploader} ${dragging || isOver ? styles.dragging : ''} ${localImage ? styles.imgAdded : ''}`}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
    >
      <input type='file' accept='image/png, image/jpeg, image/jpg, image/gif, image/svg+xml' onChange={handleFileSelect} className={styles.fileInput} />
      {localImage
        ? (
          <div className={styles.imageContainer}>
            <img src={localImage} alt='Uploaded Preview' className={styles.preview} />
            <Tooltip title='Remove Image'>
              <IconButton className={styles.removeButton} onClick={handleRemove} size='small'>
                <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={xIcon} />
              </IconButton>
            </Tooltip>
          </div>
          )
        : (
          <div className={styles.helperText}>
            <div className={styles.iconContainer}>
              <Icon icon={upload} className={styles.uploadIcon} showShadow={true}></Icon>
            </div>
            <Typography variant='body1' sx={{ lineHeight: 2 }}><span>Click to upload</span> or drag and drop</Typography>
            <Typography variant='body2'>SVG, PNG, JPG or GIF {maxDimensions && ` (max. ${maxDimensions[0]}x${maxDimensions[1]}px)`}</Typography>
            {error && <Typography className={styles.error}>{error}</Typography>}
          </div>
          )}

    </div>
  );
}
