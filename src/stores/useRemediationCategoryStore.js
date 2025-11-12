import { create } from 'zustand';

const initialState = {
  categories: [],
  selectedCategories: [],
  sort: {},
  filter: {},
  pagination: {},
  meta: {}
};

export const useRemediationCategoryStore = create(set => ({
  ...initialState,
  setCategories: categories => set({ categories }),
  addCategory: category => set(state => ({ categories: [...state.categories, category] })),
  deleteCategory: id => set(state => ({ categories: state.categories.filter(c => c.id !== id) })),
  updateCategory: (id, category) => set(state => ({ categories: state.categories.map(c => (c.id === id ? category : c)) })),
  setSelectedCategories: selectedCategories => set({ selectedCategories }),
  addSelectedCategory: category => set(state => ({ selectedCategories: [...state.selectedCategories, category] })),
  removeSelectedCategory: id => set(state => ({ selectedCategories: state.selectedCategories.filter(c => c.id !== id) })),
  setPagination: newPagination => set(state => ({ pagination: { ...state.pagination, ...newPagination } })),
  setMeta: meta => set({ meta })
}));
