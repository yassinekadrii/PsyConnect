import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function PatientListScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await client.get('/doctor/patients');
            if (response.data.success) {
                setPatients(response.data.patients);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            Alert.alert(t('common.error', 'Erreur'), t('doctor.failed_fetch_patients', 'Impossible de charger la liste des patients.'));
        } finally {
            setLoading(false);
        }
    };

    const renderPatientItem = ({ item }) => (
        <TouchableOpacity
            style={styles.patientCard}
            onPress={() => navigation.navigate('Chat', { receiverId: item._id, receiverName: `${item.firstName} ${item.lastName}` })}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.patientEmail}>{item.email}</Text>
            </View>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('doctor.patients', 'Mes Patients')}</Text>
            </LinearGradient>

            <FlatList
                data={patients}
                keyExtractor={(item) => item._id}
                renderItem={renderPatientItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyText}>{t('doctor.no_patients', 'Aucun patient trouvé')}</Text>
                    </View>
                }
            />
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
