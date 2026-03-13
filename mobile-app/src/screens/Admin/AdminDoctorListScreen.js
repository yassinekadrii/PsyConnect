import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function AdminDoctorListScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await client.get('/admin/doctors');
            if (response.data.success) {
                setDoctors(response.data.doctors);
                setFilteredDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            Alert.alert(t('common.error', 'Erreur'), t('admin.failed_fetch_doctors', 'Impossible de charger la liste des médecins.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredDoctors(doctors);
        } else {
            const filtered = doctors.filter(p =>
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(text.toLowerCase()) ||
                p.email.toLowerCase().includes(text.toLowerCase()) ||
                (p.specialty && p.specialty.toLowerCase().includes(text.toLowerCase()))
            );
            setFilteredDoctors(filtered);
        }
    };

    const handleDeleteDoctor = (id, name) => {
        Alert.alert(
            t('common.confirm', 'Confirmer'),
            t('admin.delete_doctor_confirm', { name }, `Êtes-vous sûr de vouloir supprimer le médecin ${name} ?`),
            [
                { text: t('common.cancel', 'Annuler'), style: 'cancel' },
                {
                    text: t('common.delete', 'Supprimer'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await client.delete(`/admin/doctors/${id}`);
                            if (response.data.success) {
                                Alert.alert(t('common.success', 'Succès'), t('admin.doctor_deleted', 'Médecin supprimé avec succès.'));
                                fetchDoctors();
                            }
                        } catch (error) {
                            console.error('Delete doctor error:', error);
                            Alert.alert(t('common.error', 'Erreur'), t('admin.delete_failed', 'Échec de la suppression.'));
                        }
                    }
                }
            ]
        );
    };

    const renderDoctorItem = ({ item }) => (
        <View style={styles.doctorCard}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. {item.firstName} {item.lastName}</Text>
                <Text style={styles.doctorSpecialty}>{item.specialty || t('common.not_provided')}</Text>
                <Text style={styles.doctorEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteDoctor(item._id, `${item.firstName} ${item.lastName}`)}
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
                    <Text style={styles.headerTitle}>{t('admin.doctor_list', 'Liste Médecins')}</Text>
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
                    data={filteredDoctors}
                    keyExtractor={(item) => item._id}
                    renderItem={renderDoctorItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="medkit-outline" size={64} color={COLORS.gray} />
                            <Text style={styles.emptyText}>{t('admin.no_doctors_found', 'Aucun médecin trouvé')}</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchDoctors}
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
    doctorCard: {
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
        backgroundColor: '#fdf2f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#ec4899',
        fontSize: 18,
        fontWeight: 'bold',
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
    },
    doctorSpecialty: {
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: 'Inter_500Medium',
        marginTop: 2,
    },
    doctorEmail: {
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
