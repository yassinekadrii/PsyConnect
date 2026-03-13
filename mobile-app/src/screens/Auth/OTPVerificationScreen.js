import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function OTPVerificationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { login } = useAuth();
    const { t } = useTranslation();
    const { email } = route.params;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(30);

    const inputRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(timer - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            Alert.alert(t('common.error'), t('auth.invalid_otp', 'Veuillez entrer le code à 6 chiffres.'));
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/auth/verify-email', { email, otp: code });
            if (response.data.success) {
                await login(response.data.token, response.data.user);
                Alert.alert(t('common.success'), t('auth.verify_success', 'Email vérifié avec succès !'));
                // AppNavigator will handle redirection based on user role
            } else {
                Alert.alert(t('common.error'), response.data.message);
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            Alert.alert(t('common.error'), error.response?.data?.message || t('auth.verify_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setResending(true);
        try {
            const response = await client.post('/auth/resend-otp', { email });
            if (response.data.success) {
                Alert.alert(t('common.success'), t('auth.otp_resent', 'Un nouveau code a été envoyé.'));
                setTimer(30);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            Alert.alert(t('common.error'), t('auth.resend_error'));
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('auth.verification', 'Vérification')}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="mail-open-outline" size={80} color={COLORS.primary} />
                </View>

                <Text style={styles.title}>{t('auth.verify_email_title', 'Vérifiez votre boîte mail')}</Text>
                <Text style={styles.subtitle}>
                    {t('auth.verify_email_desc', 'Nous avons envoyé un code de vérification à :')}
                    {"\n"}<Text style={styles.emailText}>{email}</Text>
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, loading && styles.disabledButton]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.verifyButtonText}>{t('auth.verify_now', 'Vérifier maintenant')}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>{t('auth.no_code', "Vous n'avez pas reçu de code ?")}</Text>
                    <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resending}>
                        <Text style={[styles.resendLink, (timer > 0 || resending) && styles.disabledLink]}>
                            {resending ? t('common.loading') :
                                timer > 0 ? `${t('auth.resend_in', 'Renvoyer dans')} ${timer}s` : t('auth.resend_now', 'Renvoyer')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
    },
    content: {
        flex: 1,
        padding: 30,
        alignItems: 'center',
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    emailText: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 24,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
        textAlign: 'center',
    },
    verifyButton: {
        width: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    verifyButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    resendContainer: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 5,
    },
    resendText: {
        color: COLORS.textLight,
        fontFamily: 'Inter_400Regular',
    },
    resendLink: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    disabledLink: {
        color: COLORS.gray,
    }
});
