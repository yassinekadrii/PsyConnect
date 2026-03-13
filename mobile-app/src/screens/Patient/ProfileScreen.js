import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            if (window.confirm(t('auth.logout_confirm', 'Êtes-vous sûr de vouloir vous déconnecter ?'))) {
                await logout();
            }
        } else {
            Alert.alert(
                t('common.logout', 'Déconnexion'),
                t('auth.logout_confirm', 'Êtes-vous sûr de vouloir vous déconnecter ?'),
                [
                    { text: t('common.cancel', 'Annuler'), style: 'cancel' },
                    {
                        text: t('common.logout', 'Déconnexion'),
                        onPress: async () => {
                            await logout();
                        },
                        style: 'destructive'
                    }
                ]
            );
        }
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        {user.profilePicture ? (
                            <Image
                                source={{ uri: user.profilePicture.startsWith('http') ? user.profilePicture : `${require('../../api/client').ROOT_URL}${user.profilePicture}` }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{user.firstName[0]}{user.lastName[0]}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editAvatar} onPress={() => navigation.navigate('EditProfile')}>
                            <Ionicons name="camera" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.userRole}>{user.role === 'patient' ? t('common.patient', 'Patient') : t('common.specialist', 'Spécialiste')}</Text>
                </View>
            </LinearGradient>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.account_settings', 'Paramètres du compte')}</Text>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
                    <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
                        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuLabel}>{t('profile.personal_info', 'Informations personnelles')}</Text>
                        <Text style={styles.menuValue}>{user.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                        <Ionicons name="call-outline" size={20} color="#10b981" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuLabel}>{t('common.phone', 'Téléphone')}</Text>
                        <Text style={styles.menuValue}>{user.phone || t('common.not_provided', 'Non renseigné')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PrescriptionList')}>
                    <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                        <Ionicons name="document-text-outline" size={20} color="#22c55e" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuLabel}>{t('profile.prescriptions', 'Mes Ordonnances')}</Text>
                        <Text style={styles.menuValue}>{t('profile.prescriptions_desc', 'Voir vos prescriptions médicales')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
                    <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#f59e0b" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuLabel}>{t('profile.security', 'Sécurité')}</Text>
                        <Text style={styles.menuValue}>{t('profile.change_password', 'Changer le mot de passe')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.preferences', 'Préférences')}</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
                        <Ionicons name="notifications-outline" size={20} color="#db2777" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuLabel}>{t('profile.notifications', 'Notifications')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#f0f9ff' }]}>
                        <Ionicons name="language-outline" size={20} color="#0284c7" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuLabel}>{t('common.language', 'Langue')}</Text>
                        <View style={styles.languageContainer}>
                            {['fr', 'en', 'ar'].map((lng) => (
                                <TouchableOpacity
                                    key={lng}
                                    style={[
                                        styles.langButton,
                                        i18n.language === lng && styles.langButtonActive
                                    ]}
                                    onPress={async () => {
                                        await i18n.changeLanguage(lng);
                                        await AsyncStorage.setItem('user-language', lng);
                                    }}
                                >
                                    <Text style={[
                                        styles.langButtonText,
                                        i18n.language === lng && styles.langButtonTextActive
                                    ]}>
                                        {lng === 'fr' ? 'FR' : lng === 'en' ? 'EN' : 'AR'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>{t('profile.logout_text', 'Se déconnecter')}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Version 1.0.0</Text>
                <Text style={styles.footerSubtext}>{t('common.made_by', 'Made with Yassine Kadri')}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    profileInfo: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarInitials: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: 'bold',
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.white,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    userName: {
        color: COLORS.white,
        fontSize: 24,
        fontFamily: 'PlayfairDisplay_700Bold',
        marginBottom: 4,
    },
    userRole: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        backgroundColor: COLORS.white,
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 15,
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: COLORS.textDark,
    },
    menuValue: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: COLORS.textLight,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginTop: 30,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    logoutText: {
        color: COLORS.error,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textLight,
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
    },
    footerSubtext: {
        color: COLORS.gray,
        fontSize: 12,
        marginTop: 4,
    },
    languageContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    langButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    langButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    langButtonText: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
    },
    langButtonTextActive: {
        color: COLORS.white,
    }
});
