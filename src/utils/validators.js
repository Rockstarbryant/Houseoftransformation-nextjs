export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const regex = /^(\+254|0)[17]\d{8}$/;
    return regex.test(phone);
  },

  password: (password) => {
    return password.length >= 6;
  },

  required: (value) => {
    return value && value.toString().trim().length > 0;
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  }
};