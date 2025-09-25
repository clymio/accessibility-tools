import { create } from 'zustand';
import { isDomainValid } from '@/electron/lib/utils';

export const useProfileFormStore = create((set, get) => ({
  step: 1,
  image: '',
  firstName: '',
  lastName: '',
  title: '',
  organization: {
    logo: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    address_2: '',
    city: '',
    zip_code: '',
    state: '',
    country: '',
    url: ''
  },
  isOrganization: false,
  errors: {
    firstName: false,
    lastName: false,
    title: false,
    organization: {
      name: false,
      email: false
    }
  },
  touched: {
    firstName: false,
    lastName: false,
    title: false,
    organization: {
      name: false,
      email: false
    }
  },
  isSubmitting: false,

  setStep: newStep => set({ step: newStep }),
  setImage: image => set({ image }),
  setFirstName: firstName => set({ firstName }),
  setLastName: lastName => set({ lastName }),
  setTitle: title => set({ title }),
  setIsOrganization: isOrganization => set({ isOrganization }),

  setOrganization: updates =>
    set(state => ({
      organization: { ...state.organization, ...updates }
    })),

  setErrors: errors => set({ errors }),
  setTouched: touched => set({ touched }),
  setIsSubmitting: isSubmitting => set({ isSubmitting }),

  handleBlur: (field) => {
    set((state) => {
      let updatedTouched = { ...state.touched, [field]: true };

      if (field.startsWith('organization.')) {
        updatedTouched.organization = { ...state.touched.organization, [field.split('.')[1]]: true };
      }

      return { touched: updatedTouched };
    });

    get().validateForm();
  },

  validateForm: () => {
    const { firstName, lastName, title, isOrganization, organization } = get();
    let errors = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!title.trim()) errors.title = 'Title is required';

    if (isOrganization) {
      let orgErrors = {};
      if (!organization.name.trim()) orgErrors.name = 'Organization name is required';
      if (!organization.email.trim()) {
        orgErrors.email = 'Email is required';
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(organization.email)) {
        orgErrors.email = 'Invalid email format';
      }

      if (organization.url.trim() && !isDomainValid(organization.url)) {
        orgErrors.url = 'Invalid website URL';
      }

      if (Object.keys(orgErrors).length > 0) {
        errors.organization = orgErrors;
      }
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  resetForm: () =>
    set({
      step: 1,
      connected: false,
      connectedCompany: '',
      image: '',
      firstName: '',
      lastName: '',
      title: '',
      isOrganization: false,
      organization: {
        id: '',
        logo: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        address_2: '',
        city: '',
        zip_code: '',
        state: '',
        country: '',
        url: ''
      },
      errors: {
        firstName: false,
        lastName: false,
        title: false,
        organization: {
          name: false,
          email: false
        }
      },
      touched: {
        firstName: false,
        lastName: false,
        title: false,
        organization: {
          name: false,
          email: false
        }
      },
      isSubmitting: false
    })
}));
