import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function DoctorDashboard() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const StatCard = ({ title, value, icon, gradient, color }) => (
        <View style={styles.statCard}>
            <LinearGradient colors={gradient} style={styles.statIconContainer}>
                <Ionicons name={icon} size={24} color={COLORS.white} />
            </LinearGradient>
            <View>
                <Text style={styles.statLabel}>{title}</Text>
                <Text style={[styles.statValue, { color: color }]}>{value}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>{t('common.welcome_back', 'Bon retour !')}</Text>
                        <Text style={styles.headerSubtitle}>Dr. {user?.firstName} {user?.lastName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={logout} style={styles.profileBtn}>
                            <Ionicons name="log-out-outline" size={32} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                            <Ionicons name="person-circle" size={40} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('doctor.quick_actions', 'Actions Rapides')}</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('PatientList')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
                                <Ionicons name="people" size={24} color="#6366f1" />
                            </View>
                            <Text style={styles.actionText}>{t('doctor.patients', 'Mes Patients')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('MessageList')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
                                <Ionicons name="chatbubbles" size={24} color="#ec4899" />
                            </View>
                            <Text style={styles.actionText}>{t('common.messages', 'Messages')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
                                <Ionicons name="settings" size={24} color="#10b981" />
                            </View>
                            <Text style={styles.actionText}>{t('common.settings', 'Paramètres')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Placeholder for Recent Consultations */}
                <View style={[styles.section, { marginTop: 30 }]}>
                    <Text style={styles.sectionTitle}>{t('doctor.recent_consultations', 'Consultations Récentes')}</Text>
                    <View style={styles.placeholderCard}>
                        <Ionicons name="calendar-outline" size={48} color={COLORS.gray} />
                        <Text style={styles.placeholderText}>{t('doctor.no_recent_consultations', 'Aucune consultation récente')}</Text>
                    </View>
                </View>
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
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Inter_600SemiBold',
        marginTop: 4,
    },
    profileBtn: {
        padding: 5,
    },
    content: {
        padding: 20,
        marginTop: -30,
    },
    section: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.textDark,
        marginBottom: 15,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
        textAlign: 'center',
    },
    placeholderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 10,
        color: COLORS.textLight,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    }
});
