import Dialog from '@/modules/core/Dialog';
import styles from './DownloadReport.module.scss';
import Icon from '@/modules/core/Icon/Icon.component';
import { useState } from 'react';
import { REPORT_FORMATS } from '@/constants/report';
import Select from '@/modules/core/Select';
import { useSnackbarStore } from '@/stores';
import { download } from '@/assets/icons';

export default function DownloadReport({ open, onClose, audit, isPreview = false, onDownloadSuccess }) {
  const { openSnackbar } = useSnackbarStore();
  const [format, setFormat] = useState(REPORT_FORMATS.PDF);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    let result;
    try {
      result = await window.api.audit.generateReport({ id: audit.id, is_preview: isPreview, format: format });
      if (result.success) {
        openSnackbar({ message: result.message, severity: 'success' });
        onClose();
      }
    } catch (e) {
      console.error('Error downloading audit report:', e);
      openSnackbar({ message: 'Error downloading file', severity: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title='Download audit report'
        titleIcon={<Icon icon={download} className={styles.icon} showShadow={true} />}
        dialogHeaderClassName={styles.dialogHeader}
        dialogContentClassName={styles.dialogContent}
        dialogActionsClassName={styles.dialogActions}
        dialogContainerClassName={styles.dialogContainer}
        onSubmit={handleDownloadReport}
        actionsConfig={{
          nextLabel: 'Download',
          backLabel: 'Cancel',
          isSubmitting: isDownloading,
          onBack: onClose
        }}
        className={styles.dialogContentContainer}
        classes={{
          container: styles.dialogContainer,
          muiSvgIcon: styles.icon
        }}
        PaperProps={{
          style: {
            height: 'fit-content',
            minHeight: '25%',
            maxHeight: '80%',
            minWidth: '660px',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '12px',
            overflow: 'auto',
            padding: 0
          }
        }}
      >
        <Select
          label='Format'
          value={format}
          onChange={setFormat}
          options={Object.entries(REPORT_FORMATS).map(([label, value]) => ({
            label,
            value
          }))}
        />
      </Dialog>
    </>
  );
}
