import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, GRADIENTS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const Card = ({ doctor }) => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.topSection}>
                    <View style={styles.avatarContainer}>
                        {doctor.profilePicture ? (
                            <Image source={{ uri: doctor.profilePicture }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.initials}>{doctor.firstName[0]}{doctor.lastName[0]}</Text>
                            </View>
                        )}
                        <View style={styles.statusBadge} />
                    </View>
                    <View style={styles.info}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name} numberOfLines={1}>
                                Dr. {doctor.firstName} {doctor.lastName}
                            </Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#f59e0b" />
                                <Text style={styles.ratingText}>4.9</Text>
                            </View>
                        </View>
                        <Text style={styles.speciality}>{doctor.specialty || 'Psychologue Clinicien'}</Text>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color={COLORS.textLight} />
                            <Text style={styles.locationText}>{doctor.location || 'Paris, France'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tagsContainer}>
                    <View style={[styles.tag, { backgroundColor: '#eef2ff' }]}>
                        <Text style={[styles.tagText, { color: '#6366f1' }]}>{t('common.video', 'Vidéo')}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: '#ecfdf5' }]}>
                        <Text style={[styles.tagText, { color: '#10b981' }]}>{t('common.chat', 'Chat')}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: '#fff7ed' }]}>
                        <Text style={[styles.tagText, { color: '#f59e0b' }]}>{t('common.available', 'Disponible')}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceValue}>60€<Text style={styles.priceLabel}>/{t('common.session', 'séance')}</Text></Text>
                    </View>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('Chat', { doctorId: doctor._id, doctorName: `${doctor.firstName} ${doctor.lastName}` })}
                    >
                        <LinearGradient
                            colors={GRADIENTS.gradient1}
                            style={styles.bookButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.bookButtonText}>{t('common.consult', 'Consulter')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 6,
        padding: 5,
    },
    content: {
        padding: 16,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statusBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 18,
        color: COLORS.textDark,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textDark,
    },
    speciality: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: COLORS.primary,
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontFamily: 'Inter_400Regular',
    },
    tagsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
    },
    tagText: {
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    priceValue: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: COLORS.textDark,
    },
    priceLabel: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: COLORS.textLight,
    },
    bookButton: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    bookButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    bookButtonText: {
        color: COLORS.white,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
    },
});

export default Card;
