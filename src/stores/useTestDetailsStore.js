import { create } from 'zustand';
import { useTerminalStore } from './useTerminalStore';

export const useTestDetailsStore = create((set, get) => ({
  formSaved: false,
  status: '',
  notes: '',
  remediation: '',
  remediationOptions: [],
  currentTargetNode: null,
  testStats: null,

  setFormSaved: formSaved => set({ formSaved }),
  setStatus: (status) => {
    const { notes, remediation } = get();
    const isFailWithoutDetails
      = status === 'FAIL' && !notes?.trim() && !remediation;
    const shouldShowForm = status === 'INCOMPLETE' || isFailWithoutDetails;

    set({ status, formSaved: !shouldShowForm });
  },
  setNotes: notes => set({ notes }),
  setRemediation: remediation => set({ remediation }),
  setRemediationOptions: options => set({ remediationOptions: options }),
  setCurrentTargetNode: node => set({ currentTargetNode: node }),
  setTestStats: stats => set({ testStats: stats }),

  handleStatusChange: async (value) => {
    const { status, setStatus, setFormSaved, handleFormSubmit, setNotes, setRemediation, remediationOptions } = get();
    if ((status === 'INCOMPLETE' || status === 'MANUAL') && value === 'FAIL') {
      setStatus(value);
      setFormSaved(false);
      await handleFormSubmit();
      return;
    }
    if (value === 'INCOMPLETE' || status === 'MANUAL') {
      setStatus(value);
      if (remediationOptions.length > 0) {
        setRemediation(remediationOptions[0].value);
      }
      setFormSaved(false);
      await handleFormSubmit();
      return;
    }
    setStatus(value);
    await handleFormSubmit();
    setFormSaved(true);
  },

  handleFormSubmit: async () => {
    const { currentTargetNode, status, notes, remediation } = get();
    if (!currentTargetNode) return;
    const refresh = useTerminalStore.getState().refresh;

    const payload = {
      id: currentTargetNode.id,
      status,
      notes,
      remediation_id: remediation
    };

    try {
      await window.api.environmentPage.updateEnvironmentTestTarget(payload);
      refresh();
    } catch (error) {
      console.error('Error updating test target:', error);
      set({ formSaved: false });
    }
  }
}));
