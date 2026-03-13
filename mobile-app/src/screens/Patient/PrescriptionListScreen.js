import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { COLORS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PrescriptionListScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            title: t('profile.prescriptions', 'Mes Ordonnances'),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
            ),
        });

        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/prescriptions/patient/${user.id}`);
            if (response.data.success) {
                setPrescriptions(response.data.prescriptions);
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            Alert.alert(t('common.error', 'Erreur'), t('prescriptions.fetch_error', 'Impossible de charger les ordonnances.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (pdfUrl) => {
        if (!pdfUrl) {
            Alert.alert(t('common.info', 'Info'), t('prescriptions.no_pdf', 'Aucun fichier PDF attaché à cette ordonnance.'));
            return;
        }

        try {
            if (pdfUrl.startsWith('http')) {
                Linking.openURL(pdfUrl);
            } else if (pdfUrl.startsWith('data:application/pdf;base64,')) {
                const base64Code = pdfUrl.split(',')[1];
                const filename = FileSystem.documentDirectory + `ordonnance_${Date.now()}.pdf`;
                await FileSystem.writeAsStringAsync(filename, base64Code, { encoding: FileSystem.EncodingType.Base64 });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(filename);
                } else {
                    Alert.alert(t('common.success', 'Succès'), 'PDF téléchargé dans les documents internes.');
                }
            } else {
                Alert.alert(t('common.info', 'Info'), t('prescriptions.invalid_pdf', 'Format PDF non reconnu.'));
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Alert.alert(t('common.error', 'Erreur'), 'Échec de lecture du PDF.');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.doctorInfo}>
                    <Ionicons name="medkit" size={20} color={COLORS.primary} />
                    <Text style={styles.doctorName}>
                        Dr. {item.doctor?.firstName} {item.doctor?.lastName}
                    </Text>
                </View>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>

            <Text style={styles.notesLabel}>Instructions:</Text>
            <Text style={styles.notesText}>{item.instructions || 'Aucune instruction'}</Text>

            {item.medicines && item.medicines.length > 0 && (
                <View style={styles.medicinesContainer}>
                    <Text style={styles.notesLabel}>Médicaments:</Text>
                    {item.medicines.map((med, index) => (
                        <Text key={index} style={styles.medicineText}>
                            • {med.name} - {med.dosage} ({med.duration})
                        </Text>
                    ))}
                </View>
            )}

            {item.pdf ? (
                <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.pdf)}>
                    <Ionicons name="download-outline" size={18} color={COLORS.white} />
                    <Text style={styles.downloadBtnText}>{t('prescriptions.download', 'Télécharger PDF')}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {prescriptions.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="document-outline" size={60} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>{t('prescriptions.empty', 'Aucune ordonnance trouvée.')}</Text>
                </View>
            ) : (
                <FlatList
                    data={prescriptions}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    listContainer: {
        padding: 20,
    },
    emptyText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 15,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    doctorName: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: COLORS.textDark,
    },
    date: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: COLORS.textLight,
    },
    notesLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: COLORS.textDark,
        marginBottom: 4,
    },
    notesText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 15,
    },
    medicinesContainer: {
        marginBottom: 15,
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
    },
    medicineText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: COLORS.primaryDark,
        marginBottom: 4,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    downloadBtnText: {
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.white,
        fontSize: 14,
    }
});
