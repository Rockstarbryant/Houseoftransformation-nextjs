// src/utils/apiConfig.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getApiUrl = () => API_URL;

export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

/*

Use in all services:

import { getApiUrl } from '../../utils/apiConfig';

const API_URL = getApiUrl();

*/