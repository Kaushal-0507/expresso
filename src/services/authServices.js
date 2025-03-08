import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const loginService = (creds) => {
  return axios.post(`${API_URL}/api/auth/login`, creds);
};

export const signUpService = (creds) => {
  return axios.post(`${API_URL}/api/auth/register`, creds);
};
