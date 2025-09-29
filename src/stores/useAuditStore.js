import { create } from 'zustand';

const initialState = {
  audit: null,
  selectedCriterion: null,
  isPageLoading: false,
  auditStats: {}
};

export const useAuditStore = create(set => ({
  ...initialState,
  setAudit: audit => set({ audit }),
  setSelectedCriterion: selectedCriterion => set({ selectedCriterion }),
  setAuditStats: auditStats => set({ auditStats }),
  getAuditStats: async (audit) => {
    const fetchedStats = await window.api.audit.getStats({ id: audit.id });

    const namedStats = fetchedStats.items.map((stat) => {
      const section = audit.sections.find(section => section.id === stat.id);
      const name = section?.name ?? 'Unknown';
      return {
        ...stat,
        name
      };
    });

    const title = ((audit.system_audit_type_version_id ?? audit.system_audit_type_id) || '').replace(/_/g, ' ');

    set({
      auditStats: {
        title,
        total: fetchedStats.total,
        updated: fetchedStats.updated,
        items: namedStats
      }
    });
  },
  reset: () => set({ ...initialState })
}));
