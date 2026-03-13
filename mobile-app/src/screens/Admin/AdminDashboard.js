import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalMessages: 0,
        totalPrescriptions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await client.get('/admin/dashboard');
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            // Alert.alert('Erreur', 'Impossible de charger les statistiques.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async () => {
        try {
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 40px; }
                        h1 { color: #6366f1; margin: 0; font-size: 32px; }
                        p.subtitle { color: #64748b; margin-top: 5px; font-size: 16px; }
                        .stats-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; }
                        .stat-card { flex: 1; min-width: 200px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
                        .stat-label { color: #64748b; font-size: 14px; margin: 0; font-weight: 500; }
                        .stat-value { font-size: 28px; font-weight: 800; margin: 10px 0; color: #1e293b; }
                        .footer { margin-top: 100px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Administration</h1>
                        <p class="subtitle">Rapport d'activité de la plateforme</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <p><strong>Date du rapport :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                        <p><strong>Généré par :</strong> ${user?.firstName} ${user?.lastName} (Admin)</p>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <p class="stat-label">Total Utilisateurs</p>
                            <p class="stat-value">${stats.totalUsers}</p>
                        </div>
                        <div class="stat-card">
                            <p class="stat-label">Total Médecins</p>
                            <p class="stat-value">${stats.totalDoctors}</p>
                        </div>
                        <div class="stat-card">
                            <p class="stat-label">Total Patients</p>
                            <p class="stat-value">${stats.totalPatients}</p>
                        </div>
                        <div class="stat-card">
                            <p class="stat-label">Messages Échangés</p>
                            <p class="stat-value">${stats.totalMessages}</p>
                        </div>
                        <div class="stat-card">
                            <p class="stat-label">Ordonnances Émises</p>
                            <p class="stat-value">${stats.totalPrescriptions}</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>© ${new Date().getFullYear()} - Rapport Confidentiel</p>
                        <p>Généré via l'application mobile Admin</p>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('PDF Error:', error);
            Alert.alert(t('common.error', 'Erreur'), t('admin.pdf_error', 'Impossible de générer le rapport PDF.'));
        }
    };

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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>
                            {user?.role === 'admin'
                                ? t('admin.dashboard_title', 'Dashboard Admin')
                                : t('common.dashboard', 'Tableau de Bord')}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {user?.role === 'admin'
                                ? t('admin.management_subtitle', 'Gestion de la plateforme')
                                : t('common.welcome_back', 'Bon retour !')}
                        </Text>
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
                <View style={styles.statsGrid}>
                    <StatCard
                        title={t('admin.total_patients', 'Total Patients')}
                        value={stats.totalPatients}
                        icon="people"
                        gradient={['#6366f1', '#8b5cf6']}
                        color="#6366f1"
                    />
                    <StatCard
                        title={t('admin.total_doctors', 'Total Médecins')}
                        value={stats.totalDoctors}
                        icon="medkit"
                        gradient={['#ec4899', '#f43f5e']}
                        color="#ec4899"
                    />
                    <StatCard
                        title={t('admin.prescriptions', 'Ordonnances')}
                        value={stats.totalPrescriptions}
                        icon="document-text"
                        gradient={['#10b981', '#059669']}
                        color="#10b981"
                    />
                    <StatCard
                        title={t('admin.messages', 'Messages')}
                        value={stats.totalMessages}
                        icon="chatbubbles"
                        gradient={['#f59e0b', '#d97706']}
                        color="#f59e0b"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('admin.quick_actions', 'Actions Rapides')}</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('CreateDoctor')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
                                <Ionicons name="add-circle" size={24} color="#6366f1" />
                            </View>
                            <Text style={styles.actionText}>{t('admin.add_doctor', 'Ajouter Médecin')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('AdminDoctorList')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
                                <Ionicons name="medkit" size={24} color="#ec4899" />
                            </View>
                            <Text style={styles.actionText}>{t('admin.doctor_list', 'Liste Médecins')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.actionGrid, { marginTop: 10 }]}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('AdminPatientList')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#f0f9ff' }]}>
                                <Ionicons name="people" size={24} color="#0ea5e9" />
                            </View>
                            <Text style={styles.actionText}>{t('admin.patient_list', 'Liste Patients')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleGeneratePDF}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
                                <Ionicons name="stats-chart" size={24} color="#10b981" />
                            </View>
                            <Text style={styles.actionText}>{t('admin.pdf_report', 'Rapport PDF')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('admin.recent_activity', 'Activité Récente')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>{t('common.see_all', 'Voir tout')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityList}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={styles.activityItem}>
                                <View style={styles.activityDot} />
                                <View>
                                    <Text style={styles.activityTitle}>{t('admin.new_doctor_registered', 'Nouveau docteur inscrit')}</Text>
                                    <Text style={styles.activityTime}>{t('admin.hours_ago', { count: 2 }, 'Il y a 2 heures')}</Text>
                                </View>
                            </View>
                        ))}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 28,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Inter_400Regular',
    },
    profileBtn: {
        padding: 5,
    },
    content: {
        padding: 20,
        marginTop: -30,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    statCard: {
        width: (width - 55) / 2,
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        fontFamily: 'Inter_500Medium',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold',
    },
    section: {
        marginTop: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
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
    activityList: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 15,
    },
    activityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    activityTitle: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: COLORS.textDark,
    },
    activityTime: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    seeAll: {
        fontSize: 12,
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    }
});
