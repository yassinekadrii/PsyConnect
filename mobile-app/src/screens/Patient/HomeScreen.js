import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await client.get('/patient/doctors');
            if (response.data.success) {
                setDoctors(response.data.doctors);
                setFilteredDoctors(response.data.doctors);
            } else {
                Alert.alert(t('common.error', 'Erreur'), response.data.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error', 'Erreur'), t('home.load_doctors_error', 'Impossible de charger les spécialistes. Vérifiez votre connexion.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredDoctors(doctors);
        } else {
            const filtered = doctors.filter(doc =>
                `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(text.toLowerCase()) ||
                (doc.speciality && doc.speciality.toLowerCase().includes(text.toLowerCase()))
            );
            setFilteredDoctors(filtered);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.welcomeText}>{t('home.welcome', 'Bonjour')},</Text>
                        <Text style={styles.userName}>{user?.firstName || t('common.user', 'Utilisateur')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                                {user ? `${user.firstName[0]}${user.lastName[0]}` : <Ionicons name="person" size={20} color={COLORS.white} />}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t('home.search_placeholder', 'Rechercher un médecin ou une spécialité...')}
                            placeholderTextColor={COLORS.textLight}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Mood Tracker Shortcut */}
            <TouchableOpacity
                style={styles.moodShortcut}
                onPress={() => navigation.navigate('MoodTracker')}
            >
                <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.moodShortcutGradient}>
                    <View style={styles.moodShortcutContent}>
                        <View>
                            <Text style={styles.moodShortcutTitle}>Comment ça va ?</Text>
                            <Text style={styles.moodShortcutSubtitle}>Suivre votre humeur</Text>
                        </View>
                        <View style={styles.moodIconContainer}>
                            <Ionicons name="sunny-outline" size={24} color={COLORS.white} />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('home.loading_specialists', 'Recherche des meilleurs spécialistes...')}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDoctors}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <Card doctor={item} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.sectionTitle}>
                            {searchQuery ? t('home.results_for', { query: searchQuery }) : t('home.our_specialists', 'Nos Spécialistes')}
                            <Text style={styles.countText}> ({filteredDoctors.length})</Text>
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color={COLORS.gray} />
                            <Text style={styles.emptyTitle}>{t('home.no_specialists_found', 'Aucun spécialiste trouvé')}</Text>
                            <Text style={styles.emptySubtitle}>{t('home.empty_subtitle', 'Essayez de modifier vos critères de recherche.')}</Text>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => handleSearch('')}>
                                <Text style={styles.resetBtnText}>{t('common.show_all', 'Tout afficher')}</Text>
                            </TouchableOpacity>
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
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    userName: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 22,
        color: COLORS.textDark,
    },
    profileButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.textDark,
    },
    filterBtn: {
        width: 50,
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        paddingTop: 10,
    },
    sectionTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: COLORS.textDark,
        marginBottom: 15,
        marginTop: 10,
    },
    countText: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: 'normal',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        color: COLORS.textLight,
        fontFamily: 'Inter_400Regular',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        padding: 20,
    },
    emptyTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: COLORS.textDark,
        marginTop: 15,
    },
    emptySubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    resetBtn: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
    },
    resetBtnText: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    moodShortcut: {
        marginHorizontal: 20,
        marginTop: -15,
        marginBottom: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    moodShortcutGradient: {
        padding: 15,
    },
    moodShortcutContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moodShortcutTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
    },
    moodShortcutSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginTop: 2,
        fontFamily: 'Inter_400Regular',
    },
    moodIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
