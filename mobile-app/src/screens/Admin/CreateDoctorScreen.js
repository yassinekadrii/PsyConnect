import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';
import { useTranslation } from 'react-i18next';

export default function CreateDoctorScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        specialty: '',
        location: '',
        bio: ''
    });

    const handleCreate = async () => {
        const { firstName, lastName, email, password, phone } = formData;

        if (!firstName || !lastName || !email || !password || !phone) {
            Alert.alert(t('common.error', 'Erreur'), t('admin.fill_required_fields', 'Veuillez remplir tous les champs obligatoires.'));
            return;
        }

        setLoading(true);
        try {
            // Updated to use the correct administrative route
            const response = await client.post('/admin/create-doctor', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                specialty: formData.specialty,
                location: formData.location
            });

            if (response.data.success) {
                Alert.alert(t('common.success', 'Succès'), t('admin.doctor_created_success', 'Le compte médecin a été créé avec succès.'), [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert(t('common.error', 'Erreur'), response.data.message || t('admin.create_failed', 'Échec de la création'));
            }
        } catch (error) {
            console.error('Create doctor error:', error);
            let detailedError = 'Impossible de contacter le serveur.';
            if (error.response) {
                const data = error.response.data;
                detailedError = `Status: ${error.response.status}\nMessage: ${data.message || 'N/A'}\nDetails: ${JSON.stringify(data.debug || data.errors || '', null, 2)}`;
                console.log('Detailed Server Error:', data);
            }
            Alert.alert(t('admin.creation_error', 'Erreur de Création'), detailedError);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('admin.new_doctor', 'Nouveau Médecin')}</Text>
            </LinearGradient>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Input
                        label={t('common.first_name', 'Prénom') + " *"}
                        placeholder="Jean"
                        value={formData.firstName}
                        onChangeText={(v) => updateField('firstName', v)}
                    />
                    <Input
                        label={t('common.last_name', 'Nom') + " *"}
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChangeText={(v) => updateField('lastName', v)}
                    />
                    <Input
                        label={t('common.email', 'Email') + " *"}
                        placeholder="docteur@psyconnect.com"
                        keyboardType="email-address"
                        value={formData.email}
                        onChangeText={(v) => updateField('email', v)}
                    />
                    <Input
                        label={t('common.phone', 'Téléphone') + " *"}
                        placeholder="06 12 34 56 78"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(v) => updateField('phone', v)}
                    />
                </View>

                <View style={styles.section}>
                    <Input
                        label={t('common.password', 'Mot de passe') + " *"}
                        placeholder="••••••••"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(v) => updateField('password', v)}
                    />
                </View>

                <View style={styles.section}>
                    <Input
                        label={t('common.specialty', 'Spécialité')}
                        placeholder={t('admin.specialty_placeholder', 'Psychologue clinicien')}
                        value={formData.specialty}
                        onChangeText={(v) => updateField('specialty', v)}
                    />
                    <Input
                        label={t('common.location', 'Ville / Adresse')}
                        placeholder="Paris, France"
                        value={formData.location}
                        onChangeText={(v) => updateField('location', v)}
                    />
                </View>

                <Button
                    title={t('admin.create_doctor_btn', 'Créer le compte médecin')}
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.submitBtn}
                />
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.white,
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        paddingLeft: 10,
    },
    submitBtn: {
        marginTop: 10,
        marginBottom: 40,
    },
    bottomSpacer: {
        height: 60,
    }
});
