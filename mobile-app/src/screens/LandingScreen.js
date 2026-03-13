import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../constants/theme';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const logoImg = require('../../assets/logo.png');

export default function LandingScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [featuredDoctors, setFeaturedDoctors] = useState([]);

    useEffect(() => {
        const fetchPreviewDoctors = async () => {
            try {
                const response = await client.get('/patient/doctors');
                if (response.data.success && Array.isArray(response.data.doctors)) {
                    setFeaturedDoctors(response.data.doctors.slice(0, 5));
                } else {
                    console.log('[LandingScreen] No doctors array found in success response');
                    throw new Error('No doctors');
                }
            } catch (error) {
                console.log('Error fetching preview doctors:', error);
                setFeaturedDoctors([]);
            }
        };
        fetchPreviewDoctors();
    }, []);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const navigateTo = (screen) => {
        console.log('[LandingScreen] Navigating to:', screen);
        setMenuVisible(false);
        navigation.navigate(screen);
    };

    const renderDoctorPreview = ({ item }) => (
        <TouchableOpacity
            style={styles.docPreviewCard}
            onPress={() => navigation.navigate('Login')}
        >
            <View style={styles.docAvatarContainer}>
                <View style={styles.docAvatarPlaceholder}>
                    <Ionicons name="person" size={30} color={COLORS.white} />
                </View>
                <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.docName} numberOfLines={1}>Dr. {item.firstName} {item.lastName}</Text>
            <Text style={styles.docSpecialty} numberOfLines={1}>{item.specialty || t('common.specialist', 'Psychologue Spécialiste')}</Text>
            <View style={styles.docRating}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.docRatingText}>{item.rating || '4.9'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Navbar (Fixed) */}
            <View style={[styles.navbar, { paddingTop: insets.top + 10 }]}>
                <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
                <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
                    <Ionicons name={menuVisible ? "close" : "menu"} size={30} color={COLORS.textDark} />
                </TouchableOpacity>
            </View>

            {/* Mobile Menu Overlay */}
            {menuVisible && (
                <View style={[styles.mobileMenu, { top: 60 + insets.top }]}>
                    <ScrollView contentContainerStyle={styles.menuItems}>
                        {/* Common Links */}
                        {['Accueil', 'Services', 'Spécialistes', 'Contact'].map((item, idx) => {
                            const keys = ['home', 'services', 'specialists', 'contact'];
                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.menuLink}
                                    onPress={() => setMenuVisible(false)}
                                    onLongPress={keys[idx] === 'contact' ? () => navigateTo('IPSettings') : undefined}
                                    delayLongPress={1000}
                                >
                                    <Text style={styles.menuText}>{t(`nav.${keys[idx]}`, item)}</Text>
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.menuDivider} />

                        {!user ? (
                            <>
                                <TouchableOpacity style={styles.menuBtn} onPress={() => navigateTo('Login')}>
                                    <Text style={styles.menuBtnText}>{t('common.login', 'Se Connecter')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuBtnPrimary} onPress={() => navigateTo('Register')}>
                                    <LinearGradient colors={GRADIENTS.gradient1} style={styles.gradientBtn}>
                                        <Text style={styles.menuBtnPrimaryText}>{t('common.register', "S'inscrire")}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.menuLink} onPress={() => navigateTo('Profile')}>
                                    <Text style={styles.menuText}>{t('common.profile', 'Profil')}</Text>
                                </TouchableOpacity>

                                {user?.role === 'doctor' ? (
                                    <TouchableOpacity style={styles.menuLink} onPress={() => navigateTo('PatientList')}>
                                        <Text style={styles.menuText}>{t('doctor.patients', 'Mes Patients')}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.menuLink} onPress={() => navigateTo('MessageList')}>
                                        <Text style={styles.menuText}>{t('common.messages', 'Messages')}</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={[styles.menuBtn, { borderColor: '#ef4444' }]} onPress={() => { logout(); setMenuVisible(false); }}>
                                    <Text style={[styles.menuBtnText, { color: '#ef4444' }]}>{t('common.logout', 'Déconnexion')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={['#6366f115', '#8b5cf615']}
                        style={styles.heroBackground}
                    />
                    <View style={styles.heroContent}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{t('hero.badge', '#1 Plateforme de Psychologie')}</Text>
                        </View>
                        <Text style={styles.heroTitle}>
                            {t('hero.title_part1', 'Votre bien-être notre')} <Text style={styles.highlight}>{t('hero.title_part2', 'priorité')}</Text>
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            {t('hero.subtitle', 'Consultez des psychologues qualifiés depuis le confort de votre domicile. Thérapie sécurisée, confidentielle et accessible.')}
                        </Text>
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.mainAction} onPress={() => navigation.navigate('Register')}>
                                <LinearGradient colors={GRADIENTS.gradient1} style={styles.mainActionGradient}>
                                    <Text style={styles.mainActionText}>{t('hero.start_button', 'Commencer')}</Text>
                                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.secondaryActionText}>{t('hero.learn_more_button', 'En savoir plus')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    {[
                        { label: t('stats.users', 'Utilisateurs'), value: '10k+', icon: 'people' },
                        { label: t('stats.specialists', 'Spécialistes'), value: '150+', icon: 'medkit' },
                        { label: t('stats.sessions', 'Sessions'), value: '25k+', icon: 'videocam' },
                    ].map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Specialists Preview Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTag}>{t('specialists.tag', 'Experts')}</Text>
                            <Text style={styles.sectionTitle}>{t('specialists.title', 'Nos Spécialistes')}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.seeAll}>{t('common.see_all', 'Voir tout')}</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={featuredDoctors}
                        keyExtractor={(item) => item._id}
                        renderItem={renderDoctorPreview}
                        contentContainerStyle={styles.docList}
                    />
                </View>

                {/* Services Section */}
                <View style={[styles.section, { backgroundColor: '#fcfdff' }]}>
                    <Text style={styles.sectionTagCenter}>{t('services.tag', 'Services')}</Text>
                    <Text style={styles.sectionTitleCenter}>{t('services.title', 'Comment nous vous aidons')}</Text>

                    <View style={styles.servicesGrid}>
                        <View style={styles.serviceItem}>
                            <LinearGradient colors={GRADIENTS.gradient1} style={styles.serviceIcon}>
                                <Ionicons name="videocam" size={24} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={styles.serviceTitle}>{t('services.video.title', 'Vidéo Consultation')}</Text>
                            <Text style={styles.serviceDesc}>{t('services.video.desc', 'Parlez en face à face avec votre thérapeute via notre plateforme sécurisée.')}</Text>
                        </View>

                        <View style={styles.serviceItem}>
                            <LinearGradient colors={GRADIENTS.gradient2} style={styles.serviceIcon}>
                                <Ionicons name="chatbubbles" size={24} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={styles.serviceTitle}>{t('services.chat.title', 'Chat Privé')}</Text>
                            <Text style={styles.serviceDesc}>{t('services.chat.desc', 'Échangez par messages instantanés pour un suivi quotidien et flexible.')}</Text>
                        </View>

                        <View style={styles.serviceItem}>
                            <LinearGradient colors={GRADIENTS.gradient3} style={styles.serviceIcon}>
                                <Ionicons name="calendar" size={24} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={styles.serviceTitle}>{t('services.booking.title', 'RDV Flexible')}</Text>
                            <Text style={styles.serviceDesc}>{t('services.booking.desc', 'Prenez rendez-vous en quelques clics selon vos disponibilités.')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerBranding}>
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                            style={styles.logoPill}
                        >
                            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
                            <Text style={styles.footerLogoAr}>طمئن</Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.footerText}>{t('footer.tagline', 'Rendre la thérapie accessible à tous, partout.')}</Text>
                    <View style={styles.socials}>
                        {['logo-facebook', 'logo-instagram', 'logo-twitter'].map(s => (
                            <TouchableOpacity key={s} style={styles.socialIcon}>
                                <Ionicons name={s} size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.copyright}>© 2026 {t('common.app_name', 'PsyConnect')} - {t('common.made_by', 'Made with Yassine Kadri')}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    navbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    logoImage: {
        height: 35,
        width: 120,
    },
    hamburger: {
        padding: 5,
    },
    mobileMenu: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.98)',
        zIndex: 99,
        padding: 20,
    },
    menuItems: {
        paddingTop: 20,
        alignItems: 'center',
    },
    menuLink: {
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
    },
    menuText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 18,
        color: COLORS.textDark,
    },
    menuDivider: { height: 20 },
    menuBtn: {
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.primary,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    menuBtnText: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    menuBtnPrimary: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
    },
    gradientBtn: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    menuBtnPrimaryText: {
        color: COLORS.white,
        fontFamily: 'Inter_600SemiBold',
    },
    heroSection: {
        paddingTop: 120,
        paddingBottom: 40,
        paddingHorizontal: 20,
        minHeight: 450,
        justifyContent: 'center',
    },
    heroBackground: {
        ...StyleSheet.absoluteFillObject,
        borderBottomRightRadius: 80,
    },
    heroContent: {
        alignItems: 'flex-start',
    },
    badge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    badgeText: {
        fontSize: 12,
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    heroTitle: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 40,
        color: COLORS.textDark,
        lineHeight: 48,
        marginBottom: 15,
    },
    highlight: {
        color: COLORS.primary,
    },
    heroSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.textLight,
        lineHeight: 24,
        marginBottom: 30,
    },
    heroActions: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    mainAction: {
        flex: 1,
        borderRadius: 30,
        overflow: 'hidden',
    },
    mainActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    mainActionText: {
        color: COLORS.white,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
    },
    secondaryAction: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    secondaryActionText: {
        color: COLORS.textDark,
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
    },
    statsSection: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 20,
        paddingVertical: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        justifyContent: 'space-around',
    },
    statCard: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: COLORS.primary,
    },
    statLabel: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
    },
    section: {
        padding: 25,
        marginVertical: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    sectionTag: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionTitle: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        color: COLORS.textDark,
    },
    seeAll: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
    },
    docList: {
        paddingRight: 20,
    },
    docPreviewCard: {
        width: 160,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 15,
        marginRight: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    docAvatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    docAvatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    docName: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: COLORS.textDark,
        marginBottom: 2,
    },
    docSpecialty: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    docRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    docRatingText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#b45309',
        marginLeft: 4,
    },
    sectionTagCenter: {
        color: COLORS.primary,
        textAlign: 'center',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionTitleCenter: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 30,
    },
    servicesGrid: {
        gap: 20,
    },
    serviceItem: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    serviceTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: COLORS.textDark,
        marginBottom: 8,
    },
    serviceDesc: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
    },
    footer: {
        backgroundColor: COLORS.textDark,
        padding: 40,
        alignItems: 'center',
    },
    footerBranding: {
        marginBottom: 20,
        alignItems: 'center',
    },
    logoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    footerLogoAr: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 36,
        color: COLORS.white,
        textShadowColor: 'rgba(99, 102, 241, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
    },
    socials: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30,
    },
    socialIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    copyright: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 20,
    }
});
