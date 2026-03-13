import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import client, { ROOT_URL } from '../../api/client';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { user, updateUserData } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), t('profile.permission_denied', 'Permission d\'accès à la galerie refusée'));
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            handleUploadImage(result.assets[0].uri);
        }
    };

    const handleUploadImage = async (uri) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const fileName = uri.split('/').pop();
            const fileType = fileName.split('.').pop();

            formData.append('avatar', {
                uri: uri,
                name: fileName,
                type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
            });

            const response = await client.post('/user/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Update user data with new profile picture
                const updatedUser = { ...user, profilePicture: response.data.profilePicture };
                await updateUserData(updatedUser);
                Alert.alert(t('common.success'), t('profile.upload_success', 'Photo de profil mise à jour'));
            } else {
                Alert.alert(t('common.error'), response.data.message);
            }
        } catch (error) {
            console.error('Upload image error:', error);
            Alert.alert(t('common.error'), t('profile.upload_error', 'Erreur lors de l\'upload de l\'image'));
        } finally {
            setUploading(false);
        }
    };

    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        specialty: user?.specialty || '',
        location: user?.location || ''
    });

    const handleSave = async () => {
        if (!form.firstName || !form.lastName || !form.phone) {
            Alert.alert(t('common.error'), t('auth.fill_all_fields'));
            return;
        }

        setLoading(true);
        try {
            const response = await client.put('/auth/profile', form);
            if (response.data.success) {
                await updateUserData(response.data.user);
                Alert.alert(t('common.success'), t('profile.update_success', 'Profil mis à jour avec succès'));
                navigation.goBack();
            } else {
                Alert.alert(t('common.error'), response.data.message);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert(t('common.error'), t('profile.update_error', 'Erreur lors de la mise à jour'));
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
                <Text style={styles.headerTitle}>{t('profile.edit_profile', 'Modifier le profil')}</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {uploading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        ) : (
                            <>
                                <Image
                                    source={
                                        selectedImage
                                            ? { uri: selectedImage }
                                            : (user?.profilePicture
                                                ? { uri: user.profilePicture.startsWith('http') ? user.profilePicture : `${ROOT_URL}${user.profilePicture}` }
                                                : { uri: `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random` })
                                    }
                                    style={styles.avatar}
                                />
                                <View style={styles.editBadge}>
                                    <Ionicons name="camera" size={20} color={COLORS.white} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>{t('profile.tap_to_change', 'Appuyez pour changer la photo')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>{t('common.firstname', 'Prénom')}</Text>
                    <TextInput
                        style={styles.input}
                        value={form.firstName}
                        onChangeText={(text) => setForm({ ...form, firstName: text })}
                        placeholder={t('common.firstname')}
                    />

                    <Text style={styles.label}>{t('common.lastname', 'Nom')}</Text>
                    <TextInput
                        style={styles.input}
                        value={form.lastName}
                        onChangeText={(text) => setForm({ ...form, lastName: text })}
                        placeholder={t('common.lastname')}
                    />

                    <Text style={styles.label}>{t('common.phone', 'Téléphone')}</Text>
                    <TextInput
                        style={styles.input}
                        value={form.phone}
                        onChangeText={(text) => setForm({ ...form, phone: text })}
                        placeholder={t('common.phone')}
                        keyboardType="phone-pad"
                    />

                    {user?.role === 'doctor' && (
                        <>
                            <Text style={styles.label}>{t('common.specialty', 'Spécialité')}</Text>
                            <TextInput
                                style={styles.input}
                                value={form.specialty}
                                onChangeText={(text) => setForm({ ...form, specialty: text })}
                                placeholder={t('common.specialty')}
                            />
                        </>
                    )}

                    <Text style={styles.label}>{t('common.location', 'Localisation')}</Text>
                    <TextInput
                        style={styles.input}
                        value={form.location}
                        onChangeText={(text) => setForm({ ...form, location: text })}
                        placeholder={t('common.location')}
                    />

                    <Text style={styles.label}>{t('profile.bio', 'Biographie')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={form.bio}
                        onChangeText={(text) => setForm({ ...form, bio: text })}
                        placeholder={t('profile.bio_placeholder', 'Parlez-nous de vous...')}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>{t('common.save', 'Enregistrer')}</Text>
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
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.white,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    avatarHint: {
        marginTop: 10,
        fontSize: 14,
        color: COLORS.textLight,
        fontFamily: 'Inter_500Medium',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
