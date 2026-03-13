import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import client, { SOCKET_URL } from '../../api/client';

export default function ChatScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorId, doctorName, receiverId, receiverName } = route.params;
    const peerId = doctorId || receiverId;
    const peerName = doctorName || receiverName;
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [user, setUser] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        navigation.setOptions({
            title: peerName || t('chat.title', 'Chat'),
            headerRight: () => (
                <View style={styles.headerActions}>
                    {user?.role === 'doctor' && (
                        <TouchableOpacity onPress={handleCreatePrescription} style={styles.headerIcon}>
                            <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleVideoCall} style={styles.headerIcon}>
                        <Ionicons name="videocam" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAudioCall} style={styles.headerIcon}>
                        <Ionicons name="call" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            ),
        });

        setupChat();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleVideoCall = () => {
        if (!user) return;
        navigation.navigate('VideoCall', {
            roomId: [user.id, peerId].sort().join('-'),
            receiverId: peerId,
            isVideo: true,
            isIncoming: false
        });
    };

    const handleAudioCall = () => {
        if (!user) return;
        navigation.navigate('VideoCall', {
            roomId: [user.id, peerId].sort().join('-'),
            receiverId: peerId,
            isVideo: false,
            isIncoming: false
        });
    };

    const handleCreatePrescription = () => {
        navigation.navigate('CreatePrescription', {
            patientId: peerId,
            patientName: peerName
        });
    };

    const setupChat = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const user = JSON.parse(userInfo);
            setUser(user);

            // Connect Socket
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
                query: { userId: user.id }
            });

            // Join room (simple room based on doctor ID + user ID logic for now, or just join own room)
            // The server logic in server.js listens to 'join-room'
            // Assuming a unique room ID for the pair. Ideally backend decides this. 
            // For now, let's just use a simple composite key or just fetch history.

            const roomId = [user.id, peerId].sort().join('-');
            socketRef.current.emit('join-chat', roomId);

            // Listen for messages
            socketRef.current.on('receive-message', (msg) => {
                setMessages((prev) => [...prev, msg]);
            });

            // Listen for incoming calls
            socketRef.current.on('call-started', (data) => {
                Alert.alert(
                    t('chat.incoming_call', 'Appel Entrant...'),
                    t('chat.incoming_call_desc', 'Accepter cet appel ?'),
                    [
                        { text: t('common.decline', 'Refuser'), style: "cancel" },
                        {
                            text: t('common.accept', 'Accepter'),
                            onPress: () => {
                                navigation.navigate('VideoCall', {
                                    roomId,
                                    receiverId: peerId,
                                    isVideo: true,
                                    isIncoming: true
                                });
                            }
                        }
                    ]
                );
            });

            // Fetch history
            const res = await client.get(`/messages/${peerId}`);
            if (res.data.success) {
                setMessages(res.data.messages);
            }

        } catch (error) {
            console.error("Chat setup error", error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const roomId = [user.id, peerId].sort().join('-');

        const messageData = {
            sender: user.id,
            receiver: peerId,
            content: inputText,
            createdAt: new Date().toISOString(),
        };

        // Optimistic UI update
        setMessages((prev) => [...prev, messageData]);
        setInputText('');

        try {
            // Send to API to save to DB
            await client.post('/messages', {
                receiverId: peerId,
                content: messageData.content
            });

            // Emit via socket for real-time delivery
            if (socketRef.current) {
                socketRef.current.emit('send-message', {
                    senderId: user.id,
                    receiverId: peerId,
                    content: messageData.content,
                    roomId
                });
            }
        } catch (error) {
            console.error("Send error", error);
            Alert.alert(t('common.error', 'Erreur'), t('chat.send_error', 'Échec de l\'envoi du message'));
        }
    };

    const renderItem = ({ item }) => {
        const isMe = item.sender === user?.id || item.sender._id === user?.id; // Handle populated/unpopulated
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                    {item.content}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={t('chat.type_message', 'Type a message...')}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Ionicons name="send" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginRight: 10,
    },
    headerIcon: {
        padding: 5,
    },
    list: {
        padding: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 16,
    },
    myText: {
        color: '#fff',
    },
    theirText: {
        color: '#1e293b',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        padding: 10,
    },
});
