import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';
import { useTranslation } from 'react-i18next';

export default function CreatePrescriptionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { patientId, patientName } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', notes: '' }]);
    const [instructions, setInstructions] = useState('');

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', notes: '' }]);
    };

    const removeMedicine = (index) => {
        if (medicines.length > 1) {
            const newMedicines = [...medicines];
            newMedicines.splice(index, 1);
            setMedicines(newMedicines);
        }
    };

    const updateMedicine = (index, field, value) => {
        const newMedicines = [...medicines];
        newMedicines[index][field] = value;
        setMedicines(newMedicines);
    };

    const handleSubmit = async () => {
        if (!patientId) {
            Alert.alert(t('common.error'), 'ID du patient manquant.');
            return;
        }

        const validMedicines = medicines.filter(m => m.name && m.dosage && m.duration);
        if (validMedicines.length === 0) {
            Alert.alert(t('common.error'), t('admin.fill_required_fields', 'Veuillez remplir au moins un médicament avec son dosage et sa durée.'));
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/prescriptions', {
                patientId,
                medicines: validMedicines,
                instructions
            });

            if (response.data.success) {
                Alert.alert(t('common.success'), t('admin.prescription_created_success', 'Ordonnance créée avec succès.'), [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert(t('common.error'), response.data.message || t('admin.create_failed'));
            }
        } catch (error) {
            console.error('Create prescription error:', error);
            Alert.alert(t('common.error'), t('auth.server_unreachable'));
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.headerTitle}>{t('admin.prescriptions', 'Nouvelle Ordonnance')}</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.patientInfo}>
                    <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.patientNameText}>{t('common.patient')}: {patientName || 'N/A'}</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('admin.medicines', 'Médicaments')}</Text>
                    <TouchableOpacity onPress={addMedicine} style={styles.addBtn}>
                        <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.addBtnText}>{t('common.add', 'Ajouter')}</Text>
                    </TouchableOpacity>
                </View>

                {medicines.map((med, index) => (
                    <View key={index} style={styles.medicineCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.medicineNumber}>{t('common.medicine', 'Médicament')} #{index + 1}</Text>
                            {medicines.length > 1 && (
                                <TouchableOpacity onPress={() => removeMedicine(index)}>
                                    <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Input
                            label={t('common.name', 'Nom du médicament')}
                            placeholder="ex: Paracétamol"
                            value={med.name}
                            onChangeText={(v) => updateMedicine(index, 'name', v)}
                        />
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label={t('common.dosage', 'Dosage')}
                                    placeholder="ex: 1000mg"
                                    value={med.dosage}
                                    onChangeText={(v) => updateMedicine(index, 'dosage', v)}
                                />
                            </View>
                            <View style={{ width: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Input
                                    label={t('common.duration', 'Durée')}
                                    placeholder="ex: 5 jours"
                                    value={med.duration}
                                    onChangeText={(v) => updateMedicine(index, 'duration', v)}
                                />
                            </View>
                        </View>
                        <Input
                            label={t('common.notes', 'Notes')}
                            placeholder="ex: Matin et Soir"
                            value={med.notes}
                            onChangeText={(v) => updateMedicine(index, 'notes', v)}
                        />
                    </View>
                ))}

                <View style={[styles.section, { marginTop: 10 }]}>
                    <Input
                        label={t('common.instructions', 'Instructions Générales')}
                        placeholder="Conseils supplémentaires..."
                        multiline
                        numberOfLines={4}
                        value={instructions}
                        onChangeText={setInstructions}
                        style={{ height: 100 }}
                    />
                </View>

                <Button
                    title={t('common.save', 'Enregistrer l\'ordonnance')}
                    onPress={handleSubmit}
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
    content: {
        flex: 1,
        padding: 20,
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        gap: 10,
    },
    patientNameText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: COLORS.textDark,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    addBtnText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    medicineCard: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10,
    },
    medicineNumber: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textLight,
    },
    row: {
        flexDirection: 'row',
    },
    section: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    submitBtn: {
        marginTop: 10,
        marginBottom: 40,
    },
    bottomSpacer: {
        height: 60,
    }
});
