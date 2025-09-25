import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import style from './SitemapAutocomplete.module.scss';
import { chevronDown, search } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

const generateSitemapOptions = (tree, level = 0) => {
  if (!tree) return [];
  return tree.flatMap(item => [
    {
      id: item.id,
      label: item.name,
      level,
      hasChildren: !!(item.children && item.children.length)
    },
    ...(item.children ? generateSitemapOptions(item.children, level + 1) : [])
  ]);
};

const SitemapAutocomplete = ({
  sitemap = [],
  onValueUpdate = () => {},
  placeholder = '',
  leftIcon = true,
  rightIcon = false,
  value,
  error = '',
  environmentType,
  disabled = false,
  autoFocus = false,
  onAutocompleteBlurNext = () => {},
  saveBtnRef = null
}) => {
  const wrapperRef = useRef(null);
  const paperRef = useRef(null);
  const addUrlBtnRef = useRef(null);
  const addUrlInputRef = useRef(null);
  const saveBtnInternalRef = useRef(null);
  const inputElRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [autocompleteValue, setAutocompleteValue] = useState(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isAddUrlMode, setIsAddUrlMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    setAutocompleteValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!isAutocompleteOpen) return;
    const handleGlobalMouseDown = (e) => {
      if (
        paperRef.current?.contains(e.target)
        || wrapperRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsAutocompleteOpen(false);
      setIsAddUrlMode(false);
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    return () => document.removeEventListener('mousedown', handleGlobalMouseDown);
  }, [isAutocompleteOpen]);

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => {
      inputElRef.current?.focus();
      setIsAutocompleteOpen(true);
    }, 0);

    return () => clearTimeout(t);
  }, [autoFocus]);

  const handleSubmitUrl = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!customUrl.trim()) return;

    let url = customUrl;
    if (!url.startsWith('http')) url = `https://${url}`;

    try {
      const page = await window.api.environment.createPage({
        id: environmentType,
        url
      });
      const newPageValue = { id: page.id, label: page.name };
      setAutocompleteValue(newPageValue.label);
      setInputValue(newPageValue.label);
      onValueUpdate(newPageValue);
      setCustomUrl('');
      setIsAddUrlMode(false);
      setIsAutocompleteOpen(false);
      setErrorMessage('');
    } catch (err) {
      const formattedError = err?.message?.split('Error: ').pop() || 'Failed to create page';
      setErrorMessage(formattedError);
    }
  };

  const handleInputKeyDownCapture = (e) => {
    if (e.key !== 'Tab' || !isAutocompleteOpen) return;

    if (
      addUrlInputRef.current?.contains(e.target)
      || saveBtnRef.current?.contains(e.target)
      || addUrlBtnRef.current?.contains(e.target)
    ) {
      return;
    }

    if (!e.shiftKey) {
      if (isAddUrlMode && addUrlInputRef.current) {
        e.preventDefault();
        e.stopPropagation();
        addUrlInputRef.current.focus();
        return;
      }

      const addBtn = addUrlBtnRef.current;
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        addBtn.focus();
        return;
      }
    }
  };

  const handleAddUrlBtnKeyDown = (e) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (inputElRef.current) {
        inputElRef.current.focus();
        setTimeout(() => {
          if (!isAutocompleteOpen) setIsAutocompleteOpen(true);
        }, 0);
      }
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      setIsAutocompleteOpen(false);
      setIsAddUrlMode(false);

      if (onAutocompleteBlurNext) {
        setTimeout(() => onAutocompleteBlurNext(), 0);
      }
    }
  };

  return (
    <div ref={wrapperRef} onKeyDownCapture={handleInputKeyDownCapture} style={{ width: '100%' }}>
      <Autocomplete
        id='sitemap-autocomplete'
        fullWidth
        options={generateSitemapOptions(sitemap)}
        autoHighlight
        freeSolo
        disableCloseOnSelect
        className={style.autocomplete}
        autoFocus={autoFocus}
        getOptionLabel={option => (typeof option === 'string' ? option : option?.label || '')}
        disabled={disabled}
        open={isAutocompleteOpen}
        onFocus={() => setIsAutocompleteOpen(true)}
        onOpen={() => setIsAutocompleteOpen(true)}
        onClose={(event, reason) => {
          if (reason === 'escape' || reason === 'toggleInput' || reason === 'popperClick' || reason === 'clear') {
            setIsAutocompleteOpen(false);
            setIsAddUrlMode(false);
          }
        }}
        onBlur={(e) => {
          setTimeout(() => {
            const activeEl = document.activeElement;
            if (
              paperRef.current
              && !paperRef.current.contains(activeEl)
            ) {
              setIsAutocompleteOpen(false);
              setIsAddUrlMode(false);

              if (onAutocompleteBlurNext) {
                onAutocompleteBlurNext();
              }
            }
          }, 100);
        }}
        value={autocompleteValue || ''}
        inputValue={inputValue}
        onInputChange={(e, newInputValue, reason) => {
          setInputValue(newInputValue);
          if (reason === 'input') setIsAutocompleteOpen(true);
        }}
        onChange={(e, newValue) => {
          setAutocompleteValue(newValue);
          onValueUpdate(newValue);
          setIsAutocompleteOpen(false);
          setIsAddUrlMode(false);
        }}
        renderInput={params => (
          <TextField
            {...params}
            inputRef={inputElRef}
            placeholder={placeholder || 'Search'}
            variant='outlined'
            error={Boolean(error)}
            helperText={error}
            className={style.autocompleteTextField}
            onClick={!disabled ? () => setIsAutocompleteOpen(true) : undefined}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '8px'
              }
            }}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: leftIcon
                  ? (
                    <InputAdornment sx={{ mr: 0 }} position='start'>
                      <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={search} />
                    </InputAdornment>
                    )
                  : null,
                endAdornment: !disabled && rightIcon
                  ? (
                    <InputAdornment sx={{ mr: 0 }} position='end'>
                      <Icon className={classNames('clym-contrast-exclude', style.icon)} icon={chevronDown} />
                    </InputAdornment>
                    )
                  : null
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const padding = `${(option.level + 1) * 12}px`;
          const fontWeight = option.level === 0 || option.hasChildren ? '500' : 'normal';

          return (
            <li {...props} key={option.id} style={{ paddingLeft: padding, fontWeight }} className={classNames(props.className, style.autocompleteOption)}>
              <Typography>{option.label}</Typography>
            </li>
          );
        }}
        PaperComponent={({ children }) => {
          return (
            <Paper ref={paperRef} className={style.paper}>
              {children}

              <Box className={style.customInputContainer}>
                {!isAddUrlMode
                  ? (
                    <Button
                      color='primary'
                      fullWidth
                      variant='outlined'
                      className={style.addPageButton}
                      ref={addUrlBtnRef}
                      onClick={() => {
                        setIsAddUrlMode(true);
                        setTimeout(() => addUrlInputRef.current?.focus(), 0);
                      }}
                      onKeyDown={handleAddUrlBtnKeyDown}
                    >
                      <Typography>+ Add URL</Typography>
                    </Button>
                    )
                  : (
                    <Box component='form' onSubmit={handleSubmitUrl}>
                      <Box className={style.form}>
                        <TextField
                          className={classNames(style.textField, { [style.error]: errorMessage })}
                          autoFocus
                          value={customUrl}
                          inputRef={addUrlInputRef}
                          onChange={(e) => { setErrorMessage(''); setCustomUrl(e.target.value); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsAddUrlMode(false);
                              setTimeout(() => {
                                addUrlBtnRef.current?.focus();
                              }, 100);
                            }
                            if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              saveBtnInternalRef.current?.focus();
                            }
                            if (e.key === 'Tab' && e.shiftKey) {
                              e.preventDefault();
                              if (inputElRef.current) {
                                inputElRef.current.focus();
                                setTimeout(() => {
                                  if (!isAutocompleteOpen) setIsAutocompleteOpen(true);
                                }, 0);
                              }
                            }
                          }}
                          fullWidth
                          placeholder='http://www.'
                        />
                        <Button
                          onClick={handleSubmitUrl}
                          ref={saveBtnInternalRef}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              setIsAutocompleteOpen(false);
                              setIsAddUrlMode(false);

                              if (onAutocompleteBlurNext) {
                                setTimeout(() => onAutocompleteBlurNext(), 0);
                              }
                            }

                            if (e.key === 'Tab' && e.shiftKey) {
                              e.preventDefault();
                              addUrlInputRef.current?.focus();
                            }
                          }}
                        >
                          <Typography>Save</Typography>
                        </Button>
                      </Box>
                      {errorMessage && (
                        <Box>
                          <Typography variant='caption' className={style.errorMessage}>{errorMessage}</Typography>
                        </Box>
                      )}
                    </Box>
                    )}
              </Box>
            </Paper>
          );
        }}
      />
    </div>
  );
};

export default SitemapAutocomplete;
