import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Need to install this

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const SERVER_IPS = ['192.168.0.193', '192.168.0.137', '192.168.144.237'];
const TUNNEL_URL = ''; // Add your ngrok or localtunnel URL here, e.g. 'https://psyconnect.loca.lt'
let currentIpIndex = 0;
let userDefinedBaseUrl = null;

const getBaseUrl = () => {
    // 1. Prioritize Tunnel URL (Best for APK/Reliability)
    if (TUNNEL_URL) {
        return TUNNEL_URL;
    }

    // 2. User defined IP from Settings
    if (userDefinedBaseUrl) {
        return userDefinedBaseUrl;
    }

    // 3. For Development / Expo Go
    if (Constants.expoConfig?.hostUri && __DEV__) {
        const host = Constants.expoConfig.hostUri.split(':')[0];
        return `http://${host}:3001`;
    }

    // 4. For Android Emulators in Dev
    if (Platform.OS === 'android' && __DEV__) {
        return 'http://10.0.2.2:3001';
    }

    // 5. Default for Production / APK (Fallback pool)
    return `http://${SERVER_IPS[currentIpIndex]}:3001`;
};

export const ROOT_URL = getBaseUrl();
const BASE_URL = `${ROOT_URL}/api`;
export const SOCKET_URL = ROOT_URL;

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Ensure baseURL is always fresh if switched
        config.baseURL = `${getBaseUrl()}/api`;
        return config;
    },
    (error) => Promise.reject(error)
);

// IP Fallback Interceptor
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If it's a network error and NOT using a Tunnel/User IP
        if (!error.response && !originalRequest._retry && !TUNNEL_URL && !userDefinedBaseUrl && currentIpIndex < SERVER_IPS.length - 1) {
            currentIpIndex++;
            const newBaseUrl = `http://${SERVER_IPS[currentIpIndex]}:3001`;
            console.log(`[Network] Connection failed. Retrying with fallback: ${newBaseUrl}`);

            originalRequest._retry = true;
            client.defaults.baseURL = `${newBaseUrl}/api`;
            originalRequest.baseURL = `${newBaseUrl}/api`;

            return client(originalRequest);
        }

        return Promise.reject(error);
    }
);

/**
 * Call this on app startup to load user-saved IP settings.
 */
export const initClientFromStorage = async () => {
    try {
        const savedIp = await AsyncStorage.getItem('active_server_ip');
        if (savedIp) {
            userDefinedBaseUrl = `http://${savedIp}`;
            client.defaults.baseURL = `${userDefinedBaseUrl}/api`;
            console.log('[client] Loaded saved server IP:', userDefinedBaseUrl);
        }
    } catch (e) {
        console.log('[client] Failed to load saved IP:', e);
    }
};

export default client;
