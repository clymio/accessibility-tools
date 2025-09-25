import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { Box, Slider } from '@mui/material';
import styles from './ColorSlider.module.scss';
import classNames from 'classnames';

function getHueFromHSL(hslString) {
  if (typeof hslString !== 'string') {
    return 0;
  }

  const hueMatch = hslString.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/);

  if (hueMatch) {
    return parseInt(hueMatch[1], 10);
  } else {
    return 0;
  }
}

const convertToColor = (h, l = 50) => {
  return `hsl(${h}, 100%, ${l}%)`;
};

export default function ColorSlider({ onChange, value, className }) {
  const [hueValue, setHueValue] = useState(getHueFromHSL(value));

  useEffect(() => {
    if (typeof value === 'string') {
      setHueValue(getHueFromHSL(value));
    } else {
      setHueValue(0);
    }
  }, [value]);

  const handleChange = (_, newValue) => {
    setHueValue(newValue);
    onChange && onChange(convertToColor(newValue));
  };

  const handleButtonClick = (color) => {
    setHueValue(0);
    if (onChange) {
      if (color === 'white') {
        onChange('white');
      } else if (color === 'black') {
        onChange('black');
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', padding: '10px' }} className={classNames(styles.root, className)}>
      <Slider
        step={1}
        value={hueValue}
        onChange={handleChange}
        max={360}
        min={60}
        defaultValue={60}
        sx={{
          width: '100%',
          height: 8,
          borderRadius: 6,
          background: 'linear-gradient(to right, yellow, green, cyan, blue, magenta, red)',
          '& .MuiSlider-thumb': {
            width: 32,
            height: 32,
            backgroundColor: 'white',
            border: '2px solid #ccc',
            boxShadow: '0px 0px 8px rgba(0,0,0,0.2)',
            transform: hueValue === 0 ? 'translate(0, -50%)' : hueValue === 360 ? 'translate(-100%, -50%)' : 'translate(0, -50%)'
          },
          '& .MuiSlider-track': {
            background: 'none',
            color: 'transparent'
          },
          '& .MuiSlider-rail': {
            opacity: 0
          }
        }}
      />
      <Button className={classNames('clym-contrast-exclude', styles.colorButton)} onClick={() => handleButtonClick('white')} />
      <Button className={classNames('clym-contrast-exclude', styles.colorButton)} onClick={() => handleButtonClick('black')} />
    </Box>
  );
};
