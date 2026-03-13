import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import client from '../../api/client';

const { width } = Dimensions.get('window');

const MOODS = [
    { label: 'Super', emoji: '🤩', score: 2, color: '#10b981' },
    { label: 'Bien', emoji: '😊', score: 1, color: '#6366f1' },
    { label: 'Neutre', emoji: '😐', score: 0, color: '#94a3b8' },
    { label: 'Pas top', emoji: '😕', score: -1, color: '#f59e0b' },
    { label: 'Triste', emoji: '😢', score: -2, color: '#ef4444' },
];

export default function MoodTrackerScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [selectedMood, setSelectedMood] = useState(null);
    const [history, setHistory] = useState([]);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
        fetchMoodHistory();
    }, []);

    const fetchMoodHistory = async () => {
        try {
            const response = await client.get('/moods/me');
            if (response.data.success) {
                const formattedHistory = response.data.moods.map(item => ({
                    date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                    mood: item.emoji,
                    label: item.label
                }));
                setHistory(formattedHistory);
            }
        } catch (error) {
            console.error('Error fetching mood history:', error);
        }
    };

    const handleMoodSelect = async (mood) => {
        setSelectedMood(mood);
        try {
            const response = await client.post('/moods', {
                score: mood.score,
                label: mood.label,
                emoji: mood.emoji
            });
            if (response.data.success) {
                fetchMoodHistory(); // Refresh history
            }
        } catch (error) {
            console.error('Error saving mood:', error);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#6366f1', '#a855f7']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.title}>Comment vous sentez-vous ?</Text>
                <Text style={styles.subtitle}>Suivez votre bien-être au quotidien</Text>
            </LinearGradient>

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.moodGrid}>
                    {MOODS.map((mood) => (
                        <TouchableOpacity
                            key={mood.label}
                            style={[
                                styles.moodCard,
                                selectedMood?.label === mood.label && { borderColor: mood.color, backgroundColor: mood.color + '10' }
                            ]}
                            onPress={() => handleMoodSelect(mood)}
                        >
                            <Text style={styles.emoji}>{mood.emoji}</Text>
                            <Text style={[styles.moodLabel, selectedMood?.label === mood.label && { color: mood.color, fontWeight: '700' }]}>
                                {mood.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedMood && (
                    <View style={styles.motivationCard}>
                        <Ionicons name="heart" size={32} color={COLORS.accent} />
                        <Text style={styles.motivationText}>
                            Merci de partager votre ressenti. Prendre conscience de ses émotions est le premier pas vers l'équilibre.
                        </Text>
                    </View>
                )}

                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Historique récent</Text>
                    {history.map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                            <View style={styles.historyMoodCircle}>
                                <Text style={{ fontSize: 20 }}>{item.mood}</Text>
                            </View>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyDate}>{item.date}</Text>
                                <Text style={styles.historyLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </View>
                    ))}
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingBottom: 40,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.white,
        fontFamily: 'Inter_700Bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
        fontFamily: 'Inter_400Regular',
    },
    content: {
        padding: 20,
        marginTop: -20,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    moodCard: {
        width: (width - 60) / 3,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    emoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        fontFamily: 'Inter_500Medium',
    },
    motivationCard: {
        backgroundColor: '#fdf2f8',
        borderRadius: 25,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#fce7f3',
    },
    motivationText: {
        flex: 1,
        marginLeft: 15,
        color: '#be185d',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Inter_400Regular',
    },
    historySection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: 15,
        fontFamily: 'Inter_700Bold',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    historyMoodCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyDetails: {
        flex: 1,
        marginLeft: 15,
    },
    historyDate: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    historyLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    }
});
