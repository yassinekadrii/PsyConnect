import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, useWindowDimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const logoImg = require('../../../assets/logo.png');

export default function LoginScreen() {
    const navigation = useNavigation();
    const { login } = useAuth();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('common.error', 'Erreur'), t('auth.fill_all_fields', 'Veuillez remplir tous les champs'));
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting login with:', email);
            const response = await client.post('/auth/login', { email, password });

            if (response.data.success) {
                // Use Auth Context to update state and storage
                await login(response.data.token, response.data.user);

                // Navigation will be handled automatically by AppNavigator state change
            } else {
                Alert.alert(t('common.error', 'Erreur'), response.data.message || t('auth.invalid_credentials', 'Identifiants invalides'));
            }
        } catch (error) {
            console.error('Login error details:', error);

            if (error.response?.status === 403 && error.response.data.needsVerification) {
                Alert.alert(
                    t('auth.not_verified', 'Compte non vérifié'),
                    t('auth.verify_email_first', 'Veuillez vérifier votre email pour continuer.'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        {
                            text: t('auth.verify_now'),
                            onPress: () => navigation.navigate('OTPVerification', { email: error.response.data.email })
                        }
                    ]
                );
                return;
            }

            const baseUrl = client.defaults.baseURL;
            Alert.alert(
                t('auth.conn_error', 'Erreur de Connexion'),
                `${t('auth.server_unreachable', 'Impossible de joindre le serveur.')}\n\nURL: ${baseUrl}`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Blobs (Web style) */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={[styles.blob, styles.blobTop]}
            />
            <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={[styles.blob, styles.blobBottom]}
            />

            <View style={[styles.card, width > 600 && styles.cardWeb]}>
                <View style={styles.header}>
                    <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
                    <Text style={styles.tagline}>{t('common.tagline', 'Votre bien-être mental, notre priorité')}</Text>
                </View>

                <View style={styles.formInit}>
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{t('auth.title', 'Bon retour !')}</Text>
                        <Text style={styles.subtitle}>{t('auth.subtitle', 'Connectez-vous pour accéder à votre espace')}</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('common.email', 'Adresse email')}</Text>
                        <Input
                            placeholder="votre@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('common.password', 'Mot de passe')}</Text>
                        <View style={styles.passwordContainer}>
                            <Input
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.options}>
                        <TouchableOpacity style={styles.checkboxContainer}>
                            <View style={styles.checkbox} />
                            <Text style={styles.checkboxLabel}>{t('auth.remember_me', 'Se souvenir de moi')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>{t('auth.forgot_password', 'Mot de passe oublié ?')}</Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title={loading ? t('auth.logging_in', 'Connexion en cours...') : t('common.login', 'Se connecter')}
                        onPress={handleLogin}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('auth.dont_have_account', "Vous n'avez pas de compte ? ")}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.link}>{t('auth.signup_link', "S'inscrire")}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('Landing')} style={styles.backHome}>
                        <Text style={styles.backHomeText}>← {t('common.back_to_home', "Retour à l'accueil")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.1,
    },
    blobTop: {
        top: -100,
        left: -50,
    },
    blobBottom: {
        bottom: -100,
        right: -50,
    },
    card: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: COLORS.white,
        padding: 30,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 10,
    },
    cardWeb: {
        maxWidth: 450,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoImage: {
        height: 50,
        width: 180,
        marginBottom: 10,
    },
    tagline: {
        fontSize: 14,
        color: COLORS.textLight,
        fontFamily: 'Inter_400Regular',
    },
    formInit: {
        width: '100%',
    },
    headerSection: {
        marginBottom: 25,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        fontFamily: 'Inter_400Regular',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textDark,
        marginBottom: 8,
        fontFamily: 'Inter_500Medium',
    },
    passwordContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1,
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        marginRight: 8,
    },
    checkboxLabel: {
        fontSize: 13,
        color: COLORS.textDark,
    },
    forgotPassword: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: COLORS.textLight,
    },
    link: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    backHome: {
        marginTop: 20,
        alignItems: 'center',
    },
    backHomeText: {
        color: COLORS.textLight,
        fontSize: 13,
    }
});
