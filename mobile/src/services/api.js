import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set your backend server IP address here (e.g. your computer's local Wi-Fi IP)
export const BACKEND_URL = 'http://10.0.2.2:5000/api'; // Android Emulator default, change to your Wi-Fi IP (e.g. http://192.168.1.50:5000/api) for physical devices

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@officer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error reading auth token:', err);
  }
  return config;
});

export const loginOfficer = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data?.token) {
    await AsyncStorage.setItem('@officer_token', res.data.token);
    await AsyncStorage.setItem('@officer_user', JSON.stringify(res.data.user));
    if (res.data.officerProfile) {
      await AsyncStorage.setItem('@officer_profile', JSON.stringify(res.data.officerProfile));
    }
  }
  return res.data;
};

export const verifyScan = async ({ qrToken, direction = 'ENTRY', gateId }) => {
  const res = await api.post('/scan/verify', { qrToken, direction, gateId });
  return res.data;
};

export const getAssignedGate = async () => {
  const res = await api.get('/gates/my-assignment');
  return res.data;
};

export const getGatesList = async () => {
  const res = await api.get('/gates');
  return res.data;
};

export const getShiftLogs = async () => {
  const res = await api.get('/scan/shift-logs?limit=30');
  return res.data;
};

export const logoutOfficer = async () => {
  await AsyncStorage.removeItem('@officer_token');
  await AsyncStorage.removeItem('@officer_user');
  await AsyncStorage.removeItem('@officer_profile');
};

export default api;
