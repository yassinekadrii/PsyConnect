import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../../api/client';
import { useTranslation } from 'react-i18next';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChangePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            Alert.alert(t('common.error'), t('auth.fill_all_fields'));
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            Alert.alert(t('common.error'), t('auth.passwords_not_matching'));
            return;
        }

        if (passwords.newPassword.length < 8) {
            Alert.alert(t('common.error'), t('auth.password_too_short', 'Le mot de passe doit contenir au moins 8 caractères'));
            return;
        }

        setLoading(true);
        try {
            const response = await client.put('/auth/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            if (response.data.success) {
                Alert.alert(t('common.success'), t('profile.password_update_success', 'Mot de passe mis à jour avec succès'));
                navigation.goBack();
            } else {
                Alert.alert(t('common.error'), response.data.message);
            }
        } catch (error) {
            console.error('Update password error:', error);
            const errorMsg = error.response?.data?.message || t('profile.password_update_error', 'Erreur lors de la mise à jour');
            Alert.alert(t('common.error'), errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.security', 'Sécurité')}</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.description}>{t('profile.change_password_desc', 'Mettez à jour votre mot de passe pour sécuriser votre compte.')}</Text>

                    <Text style={styles.label}>{t('profile.current_password', 'Mot de passe actuel')}</Text>
                    <TextInput
                        style={styles.input}
                        value={passwords.currentPassword}
                        onChangeText={(text) => setPasswords({ ...passwords, currentPassword: text })}
                        placeholder="••••••••"
                        secureTextEntry
                    />

                    <Text style={styles.label}>{t('profile.new_password', 'Nouveau mot de passe')}</Text>
                    <TextInput
                        style={styles.input}
                        value={passwords.newPassword}
                        onChangeText={(text) => setPasswords({ ...passwords, newPassword: text })}
                        placeholder="••••••••"
                        secureTextEntry
                    />

                    <Text style={styles.label}>{t('profile.confirm_new_password', 'Confirmer le nouveau mot de passe')}</Text>
                    <TextInput
                        style={styles.input}
                        value={passwords.confirmPassword}
                        onChangeText={(text) => setPasswords({ ...passwords, confirmPassword: text })}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>{t('profile.change_password', 'Changer le mot de passe')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
        padding: 20,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    description: {
        fontSize: 14,
        color: COLORS.textLight,
        fontFamily: 'Inter_400Regular',
        marginBottom: 20,
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: COLORS.textLight,
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: COLORS.textDark,
        fontFamily: 'Inter_400Regular',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 50,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    }
});
