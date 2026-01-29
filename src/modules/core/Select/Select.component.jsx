import { chevronDown, plus, trash2, xIcon } from '@/assets/icons';
import Icon from '@/modules/core/Icon';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography
} from '@mui/material';
import classNames from 'classnames';
import { forwardRef, useEffect, useRef, useState } from 'react';
import styles from './Select.module.scss';

const CoreSelect = forwardRef(({
  index = 0,
  multiple = false,
  value,
  onChange = () => {},
  onBlur = () => {},
  touched = false,
  errors = null,
  label = '',
  placeHolder = '',
  options = [],
  onOptionsChange = () => {},
  errorMessage = '',
  allowCustomInput = false,
  disabled = false,
  className = '',
  chipClassName = '',
  menuClassName = '',
  selectClassName = '',
  placeholderClassName = '',
  menuMaxHeight = '',
  required = false,
  sx = {},
  minWidth = null,
  autoFocus = false,
  transparentBg = false,
  useChipValueAsLabel = false
}, ref) => {
  if (value === undefined) {
    value = multiple ? [] : '';
  }
  const [openIndexes, setOpenIndexes] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const internalInputRef = useRef(null);

  useEffect(() => {
    if (document.activeElement === document.body && internalInputRef.current) {
      internalInputRef.current.focus();
    }
  }, [value]);

  const handleOpen = (index) => {
    setOpenIndexes(prev => [...prev, index]);
  };

  const handleClose = (index) => {
    setOpenIndexes(prev => prev.filter(i => i !== index));
  };

  const isOpen = index => openIndexes.includes(index);

  const handleDelete = (event, valueToDelete) => {
    event.stopPropagation();
    const newValue = value.filter(val => val !== valueToDelete);
    onChange(newValue, index);

    setTimeout(() => {
      if (ref && ref.current) {
        ref.current.focus();
      }
    });
  };

  const handleDeleteKeyDown = (event, valueToDelete) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      handleDelete(event, valueToDelete);
    }
  };

  const handleDeleteKeyUp = (event, valueToDelete) => {
    event.stopPropagation();
    if (event.key === ' ') {
      handleDelete(event, valueToDelete);
    }
  };

  const handleAddOption = () => {
    if (customInput.trim() !== '') {
      const newOption = { value: customInput, label: customInput };
      const updatedOptions = [...options, newOption];
      onOptionsChange(updatedOptions);

      if (multiple) {
        onChange([...value, customInput], index);
      } else {
        onChange(customInput, index);
      }

      setCustomInput('');
    }
  };

  const handleRemoveOption = (event, optionToRemove) => {
    event.stopPropagation();
    const updatedOptions = options.filter(opt => opt.value !== optionToRemove);
    onOptionsChange(updatedOptions);

    if (multiple) {
      onChange(
        value.filter(val => val !== optionToRemove),
        index
      );
    } else if (value === optionToRemove) {
      onChange('', index);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
      e.stopPropagation();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleAddOption();
      e.stopPropagation();
    }
  };

  return (
    <FormControl fullWidth error={Boolean(touched && errors)} className={classNames(className, { [styles.transparent]: transparentBg })} sx={{ minWidth: minWidth || undefined }}>
      <InputLabel component='span' className={styles.inputLabel} required={required}>
        <Typography>{label}</Typography>
      </InputLabel>
      <Select
        labelId={`custom-select-label-${index}`}
        value={value}
        onChange={e => onChange(e.target.value, index)}
        onBlur={() => onBlur(index)}
        onOpen={() => handleOpen(index)}
        onClose={() => handleClose(index)}
        multiple={multiple}
        variant='outlined'
        displayEmpty
        input={<OutlinedInput />}
        renderValue={(selected = []) => {
          if (multiple) {
            return selected && selected.length > 0
              ? (
                  selected.map(val => (
                    <Chip
                      key={val}
                      label={useChipValueAsLabel ? val : options.find(o => o.value === val)?.label || val}
                      className={classNames(styles.selectChip, chipClassName)}
                      onDelete={event => handleDelete(event, val)}
                      deleteIcon={(
                        <IconButton
                          onMouseDown={e => e.stopPropagation()}
                          onClick={event => handleDelete(event, val)}
                          onKeyDown={event => handleDeleteKeyDown(event, val)}
                          onKeyUp={event => handleDeleteKeyUp(event, val)}
                          className={styles.deleteChip}
                          sx={{
                            padding: '4px',
                            minWidth: 'auto',
                            width: 28,
                            height: 28,
                            '& .MuiSvgIcon-root, & img': { fontSize: '20px', width: 20, height: 20 },
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Icon className={classNames('clym-contrast-exclude', styles.chipIcon)} icon={xIcon} />
                        </IconButton>
                      )}
                      tabIndex={-1}
                    />
                  ))
                )
              : (
                <Typography className={classNames(styles.placeholder, placeholderClassName)}>{placeHolder}</Typography>
                );
          }
          return options.find(o => o.value === selected)?.label || selected || <Typography color='textSecondary'>{placeHolder}</Typography>;
        }}
        IconComponent={chevronDown}
        placeholder={placeHolder}
        className={classNames(styles.selectField, selectClassName, {
          [styles.selectFieldOpen]: isOpen(index),
          [styles.multiple]: multiple,
          [styles.transparent]: transparentBg
        })}
        disabled={options.length <= 1 || disabled}
        MenuProps={{
          PaperProps: {
            className: `${styles.selectMenu} ${menuClassName}`,
            style: {
              borderWidth: '2px',
              borderBottomRightRadius: '8px',
              borderBottomLeftRadius: '8px',
              borderColor: '#002ae6',
              ...(menuMaxHeight ? { maxHeight: menuMaxHeight } : {})
            }
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left'
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left'
          }
        }}
        sx={sx}
        autoFocus={autoFocus}
        inputRef={(el) => {
          internalInputRef.current = el;
          if (ref) {
            ref.current = el;
          }
        }}
      >
        {options?.map((option, i) => (
          <MenuItem key={option.value || i} value={option.value} disabled={option.disabled}>
            <Typography>{option.label}</Typography>
            {(option.isSystem !== undefined && !option.isSystem) && (
              <Icon className={classNames('clym-contrast-exclude', styles.optionDeleteIcon)} icon={trash2} onClick={e => handleRemoveOption(e, option.value)} />
            )}
          </MenuItem>
        ))}

        {allowCustomInput && (
          <Box px={2} py={1} display='flex' alignItems='center'>
            <TextField
              size='small'
              variant='outlined'
              placeholder='Add new'
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onKeyUp={handleKeyUp}
              fullWidth
              InputProps={{
                startAdornment: customInput
                  ? null
                  : (
                    <Box display='flex' alignItems='center' mr={1}>
                      <Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={plus} />
                    </Box>
                    )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: 'none !important',
                  '& fieldset': {
                    border: 'none !important'
                  },
                  '&:hover fieldset': {
                    border: 'none !important'
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none !important'
                  }
                }
              }}
            />
            <Button onClick={handleAddOption} variant='contained' color='primary' size='small' sx={{ ml: 1 }}>
              <Typography variant='body2'>Save</Typography>
            </Button>
          </Box>
        )}
      </Select>
      {touched && errors && (
        <Box>
          <Typography className={styles.errorMessage} color='error.main' variant='caption'>
            {errorMessage || errors}
          </Typography>
        </Box>
      )}
    </FormControl>
  );
});

CoreSelect.displayName = 'CoreSelect';

export default CoreSelect;
