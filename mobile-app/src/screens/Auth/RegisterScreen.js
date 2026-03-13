import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, useWindowDimensions, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
const logoImg = require('../../../assets/logo.png');

export default function RegisterScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
            Alert.alert(t('common.error', 'Erreur'), t('auth.fill_required_fields', 'Veuillez remplir tous les champs obligatoires'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert(t('common.error', 'Erreur'), t('auth.passwords_dont_match', 'Les mots de passe ne correspondent pas'));
            return;
        }

        if (!acceptedTerms) {
            Alert.alert(t('common.error', 'Erreur'), t('auth.accept_terms_error', 'Veuillez accepter les conditions d\'utilisation pour continuer.'));
            return;
        }

        try {
            const response = await client.post('/auth/register', {
                ...formData,
                role: 'patient'
            });

            if (response.data.success) {
                Alert.alert(
                    t('common.success', 'Succès'),
                    t('auth.account_created_verify', 'Compte créé ! Veuillez vérifier votre email.')
                );
                navigation.navigate('OTPVerification', { email: formData.email });
            } else {
                Alert.alert(t('common.error', 'Erreur'), response.data.message);
            }
        } catch (error) {
            console.error('Registration error details:', error);
            const serverMessage = error.response?.data?.message || error.message;
            Alert.alert(
                t('common.error', 'Erreur'),
                `${t('auth.registration_failed', 'Inscription échouée.')}\n\n${serverMessage}`
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Blobs */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={[styles.blob, styles.blobTop]}
            />
            <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={[styles.blob, styles.blobBottom]}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, width > 600 && styles.cardWeb]}>
                    <View style={styles.header}>
                        <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
                        <Text style={styles.tagline}>{t('common.tagline', 'Votre bien-être mental, notre priorité')}</Text>
                    </View>

                    <View style={styles.formInit}>
                        <View style={styles.headerSection}>
                            <Text style={styles.title}>{t('auth.signup_title', 'Créer un compte')}</Text>
                            <Text style={styles.subtitle}>{t('auth.signup_subtitle', 'Rejoignez notre communauté de bien-être')}</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfInput]}>
                                <Text style={styles.label}>{t('common.first_name', 'Prénom')}</Text>
                                <Input
                                    placeholder="Jean"
                                    value={formData.firstName}
                                    onChangeText={(text) => handleChange('firstName', text)}
                                />
                            </View>
                            <View style={[styles.inputGroup, styles.halfInput]}>
                                <Text style={styles.label}>{t('common.last_name', 'Nom')}</Text>
                                <Input
                                    placeholder="Dupont"
                                    value={formData.lastName}
                                    onChangeText={(text) => handleChange('lastName', text)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('common.email', 'Adresse email')}</Text>
                            <Input
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('common.phone', 'Numéro de téléphone')}</Text>
                            <Input
                                placeholder="+33 6 12 34 56 78"
                                value={formData.phone}
                                onChangeText={(text) => handleChange('phone', text)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('common.password', 'Mot de passe')}</Text>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChangeText={(text) => handleChange('password', text)}
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.confirm_password', 'Confirmer le mot de passe')}</Text>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => handleChange('confirmPassword', text)}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}
                                onPress={() => setAcceptedTerms(!acceptedTerms)}
                            >
                                {acceptedTerms && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setAcceptedTerms(!acceptedTerms)} style={{ flex: 1 }}>
                                <Text style={styles.termsText}>
                                    {t('auth.accept_terms', "J'accepte les")} <Text style={styles.linkText}>{t('auth.terms_service', "conditions d'utilisation")}</Text> {t('common.and', "et la")} <Text style={styles.linkText}>{t('auth.privacy_policy', "politique de confidentialité")}</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Button
                            title={t('auth.create_account', 'Créer mon compte')}
                            onPress={handleRegister}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('auth.already_have_account', 'Vous avez déjà un compte ? ')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>{t('auth.login_link', 'Se connecter')}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => navigation.navigate('Landing')} style={styles.backHome}>
                            <Text style={styles.backHomeText}>← {t('common.back_to_home', "Retour à l'accueil")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
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
        maxWidth: 500,
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
        maxWidth: 550,
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
        alignItems: 'center',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    halfInput: {
        flex: 1,
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        marginRight: 10,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    termsText: {
        fontSize: 13,
        color: COLORS.textDark,
        flex: 1,
        lineHeight: 20,
    },
    linkText: {
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
