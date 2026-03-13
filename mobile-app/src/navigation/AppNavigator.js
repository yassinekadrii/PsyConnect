import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import HomeScreen from '../screens/Patient/HomeScreen';
import ChatScreen from '../screens/Patient/ChatScreen';
import ProfileScreen from '../screens/Patient/ProfileScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import CreateDoctorScreen from '../screens/Admin/CreateDoctorScreen';
import AdminPatientListScreen from '../screens/Admin/AdminPatientListScreen';
import AdminDoctorListScreen from '../screens/Admin/AdminDoctorListScreen';
import LandingScreen from '../screens/LandingScreen';
import DoctorDashboard from '../screens/Doctor/DoctorDashboard';
import PatientListScreen from '../screens/Doctor/PatientListScreen';
import ChangePasswordScreen from '../screens/Patient/ChangePasswordScreen';
import MoodTrackerScreen from '../screens/Patient/MoodTrackerScreen';
import MessageListScreen from '../screens/Patient/MessageListScreen';
import EditProfileScreen from '../screens/Patient/EditProfileScreen';
import VideoCallScreen from '../screens/Patient/VideoCallScreen';
import PrescriptionListScreen from '../screens/Patient/PrescriptionListScreen';
import CreatePrescriptionScreen from '../screens/Doctor/CreatePrescriptionScreen';
import IPSettingsScreen from '../screens/Patient/IPSettingsScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

function Navigation() {
    const { user, isLoading } = useAuth();

    console.log('[Navigation] State:', { isLoading, hasUser: !!user, role: user?.role });
    if (!user) console.log('[Navigation] Rendering Guest Stack');
    else console.log('[Navigation] Rendering Auth Stack for:', user.role);

    if (isLoading) {
        return (
            <View style={loadingStyles.container}>
                <Text style={loadingStyles.logoText}>طمئن</Text>
                <ActivityIndicator size="small" color="rgba(167, 139, 250, 0.8)" style={{ marginTop: 16 }} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Landing" component={LandingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} options={{ headerShown: false }} />
                    </>
                ) : (
                    <>
                        {user?.role === 'admin' ? (
                            <Stack.Screen name="AdminMain" component={AdminDashboard} />
                        ) : user?.role === 'doctor' ? (
                            <Stack.Screen name="Main" component={DoctorDashboard} />
                        ) : (
                            <Stack.Screen name="Main" component={HomeScreen} />
                        )}
                        <Stack.Screen name="PatientList" component={PatientListScreen} />
                        <Stack.Screen name="MessageList" component={MessageListScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="CreateDoctor" component={CreateDoctorScreen} />
                        <Stack.Screen name="AdminPatientList" component={AdminPatientListScreen} />
                        <Stack.Screen name="AdminDoctorList" component={AdminDoctorListScreen} />
                        <Stack.Screen
                            name="Chat"
                            component={ChatScreen}
                            options={{ title: 'Messages', headerShown: true }}
                        />
                        <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} options={{ headerShown: true, title: 'Mes Ordonnances' }} />
                        <Stack.Screen name="CreatePrescription" component={CreatePrescriptionScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
                        <Stack.Screen name="Landing" component={LandingScreen} />
                    </>
                )}
                <Stack.Screen name="IPSettings" component={IPSettingsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function AppNavigator() {
    return (
        <AuthProvider>
            <Navigation />
        </AuthProvider>
    );
}

const loadingStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1040',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#ffffff',
        textShadowColor: 'rgba(139, 92, 246, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
});

