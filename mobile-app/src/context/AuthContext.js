import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (token && userInfo) {
                try {
                    setUser(JSON.parse(userInfo));
                } catch (parseError) {
                    console.error('[AuthContext] Error parsing userInfo:', parseError);
                    await AsyncStorage.multiRemove(['userToken', 'userInfo']);
                }
            }
        } catch (e) {
            console.error('[AuthContext] Failed to load auth data', e);
        } finally {
            console.log('[AuthContext] Storage load attempt finished');
            setIsLoading(false);
        }
    };

    const login = async (token, userInfo) => {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        setUser(userInfo);
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userInfo']);
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setUser(null);
        }
    };

    const updateUserData = async (newUserInfo) => {
        const updatedUser = { ...user, ...newUserInfo };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
