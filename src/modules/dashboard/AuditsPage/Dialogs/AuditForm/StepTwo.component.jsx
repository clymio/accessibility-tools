import { useAuditFormStore } from '@/stores/useAuditFormStore';
import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './AuditForm.module.scss';

const StepTwo = ({ isEdit = false }) => {
  const {
    reportType,
    auditVersion,
    conformanceTarget,
    chapters,
    setChapters,
    hasInitializedChapters,
    setHasInitializedChapters,
    handleBlur,
    touched,
    errors
  } = useAuditFormStore();

  const [auditChapterOptions, setAuditChapterOptions] = useState([]);

  useEffect(() => {
    const fetchAuditChapters = async () => {
      const data = await window.api.audit.findAuditChapters({ audit_type_id: reportType, audit_type_version_id: auditVersion }, { detailed: true });
      const options = data.map(chapter => ({
        name: chapter.name,
        sections: chapter.sections
      }));

      if (!isEdit) {
        const wcagRequired = getRequiredWcagIds();
        const nonWcagIds = options
          .filter(ch => ch.name !== 'WCAG')
          .flatMap(ch => ch.sections.map(sec => sec.id));

        const combined = Array.from(new Set([
          ...chapters,
          ...nonWcagIds,
          ...wcagRequired
        ]));

        setChapters(combined);
      }

      setAuditChapterOptions(options);
    };

    fetchAuditChapters();
  }, [reportType, auditVersion, conformanceTarget]);

  useEffect(() => {
    if (!auditChapterOptions.length || isEdit) return;

    const wcagRequired = getRequiredWcagIds();

    const wcagChapter = auditChapterOptions.find(ch => ch.name === 'WCAG');
    if (!wcagChapter) return;

    const allWcagIds = wcagChapter.sections.map(s => s.id);

    const nonWcagIds = chapters.filter(id => !allWcagIds.includes(id));

    const combined = Array.from(new Set([
      ...nonWcagIds,
      ...wcagRequired
    ]));

    setChapters(combined);
  }, [conformanceTarget, auditChapterOptions]);

  const handleCheckboxChange = (sectionId, isWcag) => (event) => {
    const checked = event.target.checked;
    const updated = new Set(chapters);

    if (checked) {
      updated.add(sectionId);
    } else {
      updated.delete(sectionId);
    }

    setChapters(Array.from(updated));
  };

  const getRequiredWcagIds = () => {
    const levelOrder = ['A', 'AA', 'AAA'];
    const prefixMap = {
      A: 'WCAG_A',
      AA: 'WCAG_AA',
      AAA: 'WCAG_AAA'
    };

    const targetIndex = levelOrder.indexOf(conformanceTarget);
    if (targetIndex === -1) return [];

    return levelOrder.slice(0, targetIndex + 1).map(level => prefixMap[level]);
  };

  return (
    <div>
      {auditChapterOptions.map(chapter => (
        <div key={chapter.name} className={styles.chapterGroup}>
          <Typography variant='h6' gutterBottom>
            {chapter.name}
          </Typography>
          <FormGroup>
            {chapter.sections.map((section) => {
              const isWcag = chapter.name === 'WCAG';
              const requiredWcagIds = getRequiredWcagIds();
              const isRequired = isWcag && requiredWcagIds.includes(section.id);
              return (
                <FormControlLabel
                  key={section.id}
                  control={(
                    <Checkbox
                      checked={chapters.includes(section.id)}
                      onChange={handleCheckboxChange(section.id, isWcag)}
                      onBlur={() => handleBlur('chapters')}
                      disabled={isRequired}
                      {...isRequired && { autoFocus: true }}
                    />
                  )}
                  label={section.name}
                />
              );
            })}
          </FormGroup>
        </div>
      ))}

      {touched.chapters && errors.chapters && (
        <Typography variant='caption' color='error'>
          {errors.chapters}
        </Typography>
      )}
    </div>
  );
};

export default StepTwo;
