import { LEVEL_OPTIONS_VPAT, LEVEL_OPTIONS_WCAG_ATAG } from '@/constants/audit';
import Select from '@/modules/core/Select';
import { useAuditStore } from '@/stores';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import styles from './Audit.module.scss';

const Audit = () => {
  const { audit, setAudit, selectedCriterion, setSelectedCriterion, getAuditStats } = useAuditStore();

  const [formState, setFormState] = useState({});

  const criteriaSectionRef = useRef(null);
  const levelSelectRef = useRef(null);

  useEffect(() => {
    if (!audit?.id || !selectedCriterion?.id) return;

    const fetchAuditReportItems = async () => {
      const data = await window.api.audit.findAuditReportItems({ id: audit.id });
      setAudit(data);

      const newState = {};

      selectedCriterion.types.forEach((section) => {
        let matchedType;

        for (const auditSection of data.sections || []) {
          for (const item of auditSection.items || []) {
            if (item.id === selectedCriterion.id) {
              matchedType = item.types?.find(type => type.id === section.id);
              if (matchedType) break;
            }
          }
          if (matchedType) break;
        }

        newState[section.id] = {
          level: matchedType?.level || '',
          remarks: matchedType?.remarks || ''
        };
      });

      setFormState(newState);
    };

    fetchAuditReportItems();
  }, [selectedCriterion]);

  const handleChange = (sectionId, field, value) => {
    setFormState((prev) => {
      const updatedSection = {
        ...prev[sectionId],
        [field]: value
      };

      if (field === 'level' && !value) {
        updatedSection.remarks = '';
      }

      return {
        ...prev,
        [sectionId]: updatedSection
      };
    });
  };

  if (!audit || !selectedCriterion) return null;

  const auditItems = audit.sections.map(s => s.items).flat();
  const selectedItemIdx = auditItems.findIndex(i => i.id === selectedCriterion.id);
  const nextItem = auditItems[selectedItemIdx + 1];

  const formatSectionId = (id) => {
    return id
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleFormSave = async (sectionId) => {
    const sectionState = formState[sectionId];
    if (!sectionState) return;

    try {
      await window.api.audit.updateAuditReportItem({
        id: audit.id,
        item_id: selectedCriterion.id,
        item_type_id: sectionId,
        level: sectionState.level || '',
        remarks: sectionState.level ? sectionState.remarks : ''
      });
      await getAuditStats(audit);
    } catch (e) {
      console.error('Failed to save audit report item:', e);
    }
  };

  const handleNext = () => {
    if (nextItem) {
      setSelectedCriterion(nextItem);
      criteriaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      levelSelectRef.current?.focus();
    }
  };

  const options = audit.system_audit_type_id.startsWith('WCAG') || audit.system_audit_type_id.startsWith('ATAG') ? LEVEL_OPTIONS_WCAG_ATAG : LEVEL_OPTIONS_VPAT;

  return (
    <Stack height='100%' width='100%' padding={3} spacing={4} className={styles.root}>
      <Typography variant='h4' sx={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {selectedCriterion.name ? selectedCriterion.name : selectedCriterion.id}
      </Typography>
      <Box height='100%' width='100%' flex={1} sx={{ overflow: 'auto', padding: '1.5rem', paddingBottom: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: '2rem' }} ref={criteriaSectionRef}>
          {selectedCriterion.types.map((section, i) => (
            <Box key={section.id} className={styles.formSection} mb={5}>
              {section.id !== 'FULL' && (
                <Typography variant='h6' gutterBottom>
                  {formatSectionId(section.id)}
                </Typography>
              )}

              <Box mb={2}>
                <Select
                  label='Level'
                  options={options}
                  placeHolder='Select a level'
                  value={formState[section.id]?.level}
                  onChange={value => handleChange(section.id, 'level', value)}
                  onBlur={() => handleFormSave(section.id)}
                  className={styles.formField}
                  ref={i === 0 ? levelSelectRef : null}
                />
              </Box>

              <TextField
                label='Remarks and Explanations'
                className={styles.textField}
                disabled={!formState[section.id]?.level}
                multiline
                rows={3}
                fullWidth
                margin='normal'
                value={formState[section.id]?.level ? formState[section.id]?.remarks : ''}
                onChange={e => handleChange(section.id, 'remarks', e.target.value)}
                onBlur={() => handleFormSave(section.id)}
              />
            </Box>
          ))}
          {nextItem && (
            <Button onClick={handleNext} className={styles.nextButton}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default Audit;
