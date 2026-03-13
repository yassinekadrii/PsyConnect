import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import client, { SOCKET_URL } from '../../api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import { useRef } from 'react';

export default function MessageListScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const socketRef = useRef(null);

    const fetchConversations = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await client.get('/messages/conversations');
            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            // Don't alert on background refresh
            if (showLoading) {
                Alert.alert(t('common.error', 'Erreur'), t('chat.failed_fetch_conversations', 'Impossible de charger vos conversations.'));
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations();

            // Connect socket for real-time list updates
            if (user) {
                socketRef.current = io(SOCKET_URL, {
                    transports: ['websocket'],
                    query: { userId: user.id }
                });

                socketRef.current.on('receive-message', (msg) => {
                    setConversations(prev => {
                        const newConvs = [...prev];
                        const convIndex = newConvs.findIndex(c => c.user._id === msg.sender || c.user._id === msg.receiver);

                        if (convIndex !== -1) {
                            // Update existing conversation
                            newConvs[convIndex] = {
                                ...newConvs[convIndex],
                                lastMessage: msg.content,
                                timestamp: msg.createdAt
                            };
                            // Move to top
                            const updated = newConvs.splice(convIndex, 1)[0];
                            newConvs.unshift(updated);
                        } else {
                            // If it's a new conversation, it's better to refetch to get user details
                            fetchConversations(false);
                        }
                        return newConvs;
                    });
                });
            }

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return t('common.yesterday', 'Hier');
        } else if (days < 7) {
            const weekdays = [t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat')];
            return weekdays[date.getDay()];
        }
        return date.toLocaleDateString();
    };

    const renderConversationItem = ({ item }) => (
        <TouchableOpacity
            style={styles.convCard}
            onPress={() => navigation.navigate('Chat', {
                doctorId: item.user._id, // Backwards compatible with ChatScreen expectation
                doctorName: `${item.user.firstName} ${item.user.lastName}`
            })}
        >
            <View style={styles.avatarContainer}>
                {item.user.profilePicture ? (
                    // In a real app we'd show the image, here we use initials for placeholder consistency
                    <Text style={styles.avatarText}>{item.user.firstName[0]}{item.user.lastName[0]}</Text>
                ) : (
                    <Text style={styles.avatarText}>{item.user.firstName[0]}{item.user.lastName[0]}</Text>
                )}
            </View>
            <View style={styles.convInfo}>
                <View style={styles.convHeader}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.user.role === 'doctor' ? 'Dr. ' : ''}{item.user.firstName} {item.user.lastName}
                    </Text>
                    <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
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
                <Text style={styles.headerTitle}>{t('common.messages', 'Messages')}</Text>
            </LinearGradient>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.user._id}
                renderItem={renderConversationItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyText}>{t('chat.no_conversations', 'Aucune conversation trouvée')}</Text>
                        <Text style={styles.emptySubText}>
                            {user?.role === 'doctor'
                                ? t('chat.doctor_empty_hint', 'Commencez par consulter votre liste de patients.')
                                : t('chat.patient_empty_hint', 'Commencez par consulter un spécialiste.')}
                        </Text>
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
        paddingVertical: 10,
    },
    convCard: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatarContainer: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    convInfo: {
        flex: 1,
    },
    convHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.textDark,
        maxWidth: '70%',
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.textLight,
        fontFamily: 'Inter_400Regular',
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.gray,
        fontFamily: 'Inter_400Regular',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 15,
        color: COLORS.textDark,
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_700Bold',
    },
    emptySubText: {
        marginTop: 10,
        color: COLORS.textLight,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    }
});
