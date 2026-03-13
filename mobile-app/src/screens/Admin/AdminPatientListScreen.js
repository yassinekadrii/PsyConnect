import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function AdminPatientListScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await client.get('/admin/patients');
            if (response.data.success) {
                setPatients(response.data.patients);
                setFilteredPatients(response.data.patients);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            Alert.alert(t('common.error', 'Erreur'), t('admin.failed_fetch_patients', 'Impossible de charger la liste des patients.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredPatients(patients);
        } else {
            const filtered = patients.filter(p =>
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(text.toLowerCase()) ||
                p.email.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredPatients(filtered);
        }
    };

    const handleDeletePatient = (id, name) => {
        Alert.alert(
            t('common.confirm', 'Confirmer'),
            t('admin.delete_patient_confirm', { name }, `Êtes-vous sûr de vouloir supprimer le patient ${name} ?`),
            [
                { text: t('common.cancel', 'Annuler'), style: 'cancel' },
                {
                    text: t('common.delete', 'Supprimer'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await client.delete(`/admin/patients/${id}`);
                            if (response.data.success) {
                                Alert.alert(t('common.success', 'Succès'), t('admin.patient_deleted', 'Patient supprimé avec succès.'));
                                fetchPatients();
                            }
                        } catch (error) {
                            console.error('Delete patient error:', error);
                            Alert.alert(t('common.error', 'Erreur'), t('admin.delete_failed', 'Échec de la suppression.'));
                        }
                    }
                }
            ]
        );
    };

    const renderPatientItem = ({ item }) => (
        <View style={styles.patientCard}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.patientEmail}>{item.email}</Text>
                <Text style={styles.patientPhone}>{item.phone || t('common.not_provided')}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeletePatient(item._id, `${item.firstName} ${item.lastName}`)}
            >
                <Ionicons name="trash-outline" size={20} color="#f43f5e" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('admin.patient_list', 'Liste Patients')}</Text>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('home.search_placeholder', 'Rechercher...')}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredPatients}
                    keyExtractor={(item) => item._id}
                    renderItem={renderPatientItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={COLORS.gray} />
                            <Text style={styles.emptyText}>{t('admin.no_patients_found', 'Aucun patient trouvé')}</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchPatients}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.white,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 45,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: COLORS.white,
        fontFamily: 'Inter_400Regular',
    },
    listContent: {
        padding: 20,
    },
    patientCard: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
    },
    patientEmail: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    patientPhone: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    deleteBtn: {
        padding: 10,
        backgroundColor: '#fff1f2',
        borderRadius: 10,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 15,
        color: COLORS.textLight,
        fontSize: 16,
    }
});
