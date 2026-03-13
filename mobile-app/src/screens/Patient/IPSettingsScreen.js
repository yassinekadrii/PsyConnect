import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
    ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../../api/client';

const SERVER_IPS_KEY = 'server_ips';
const ACTIVE_IP_KEY = 'active_server_ip';

export default function IPSettingsScreen() {
    const navigation = useNavigation();
    const [primaryIp, setPrimaryIp] = useState('192.168.0.137');
    const [secondaryIp, setSecondaryIp] = useState('192.168.144.237');
    const [port, setPort] = useState('3001');
    const [activeIp, setActiveIp] = useState('');
    const [testStatus, setTestStatus] = useState('');
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedIps = await AsyncStorage.getItem(SERVER_IPS_KEY);
            const savedActive = await AsyncStorage.getItem(ACTIVE_IP_KEY);
            if (savedIps) {
                const parsed = JSON.parse(savedIps);
                if (parsed.primary) setPrimaryIp(parsed.primary);
                if (parsed.secondary) setSecondaryIp(parsed.secondary);
                if (parsed.port) setPort(parsed.port);
            }
            if (savedActive) {
                setActiveIp(savedActive);
            } else {
                setActiveIp(`${primaryIp}:${port}`);
            }
        } catch (e) {
            console.log('Load settings error', e);
        }
    };

    const saveAndApply = async (ip) => {
        const targetIp = ip || primaryIp;
        const fullUrl = `http://${targetIp}:${port}/api`;

        try {
            await AsyncStorage.setItem(SERVER_IPS_KEY, JSON.stringify({
                primary: primaryIp,
                secondary: secondaryIp,
                port
            }));
            await AsyncStorage.setItem(ACTIVE_IP_KEY, `${targetIp}:${port}`);

            // Apply dynamically
            client.defaults.baseURL = fullUrl;
            setActiveIp(`${targetIp}:${port}`);

            Alert.alert('✅ Succès', `Serveur changé en:\n${fullUrl}`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible d\'enregistrer les paramètres.');
        }
    };

    const testConnection = async (ip) => {
        const fullUrl = `http://${ip}:${port}/api`;
        setTesting(true);
        setTestStatus(`🔄 Test de connexion vers ${ip}...`);
        try {
            const resp = await fetch(`${fullUrl}/health`, { signal: AbortSignal.timeout(4000) });
            if (resp.ok) {
                setTestStatus(`✅ ${ip} est accessible !`);
            } else {
                setTestStatus(`⚠️ ${ip} répond mais avec statut ${resp.status}`);
            }
        } catch (e) {
            setTestStatus(`❌ Impossible d'atteindre ${ip}.`);
        } finally {
            setTesting(false);
        }
    };

    const IpCard = ({ label, value, onChange, onTest, onApply }) => (
        <View style={styles.ipCard}>
            <Text style={styles.ipLabel}>{label}</Text>
            <TextInput
                style={styles.ipInput}
                value={value}
                onChangeText={onChange}
                placeholder="ex: 192.168.0.137"
                keyboardType="numeric"
            />
            <View style={styles.ipCardActions}>
                <TouchableOpacity style={styles.testBtn} onPress={() => onTest(value)}>
                    <Ionicons name="pulse-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.testBtnText}>Tester</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(value)}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white} />
                    <Text style={styles.applyBtnText}>Utiliser</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <LinearGradient colors={GRADIENTS.gradient1} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>⚙️ Serveur API</Text>
                    <Text style={styles.headerSubtitle}>Paramètres réseau</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.currentDisplay}>
                    <Ionicons name="wifi" size={20} color={COLORS.primary} />
                    <Text style={styles.currentLabel}>Serveur actuel: </Text>
                    <Text style={styles.currentValue}>{activeIp || '...'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Port du Serveur</Text>
                <TextInput
                    style={styles.portInput}
                    value={port}
                    onChangeText={setPort}
                    placeholder="3001"
                    keyboardType="numeric"
                />

                <Text style={styles.sectionTitle}>Adresses IP</Text>

                <IpCard
                    label="🏠 IP Principale"
                    value={primaryIp}
                    onChange={setPrimaryIp}
                    onTest={testConnection}
                    onApply={saveAndApply}
                />

                <IpCard
                    label="🔄 IP Secondaire (Fallback)"
                    value={secondaryIp}
                    onChange={setSecondaryIp}
                    onTest={testConnection}
                    onApply={saveAndApply}
                />

                {testStatus ? (
                    <View style={styles.statusBox}>
                        <Text style={styles.statusText}>{testStatus}</Text>
                    </View>
                ) : null}

                <TouchableOpacity style={styles.saveAllBtn} onPress={() => saveAndApply(primaryIp)}>
                    <Ionicons name="save-outline" size={20} color={COLORS.white} />
                    <Text style={styles.saveAllBtnText}>Enregistrer & Utiliser IP Principale</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    backButton: {},
    headerTitle: {
        fontSize: 20,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Inter_400Regular',
    },
    content: {
        padding: 20,
    },
    currentDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 25,
        gap: 8,
    },
    currentLabel: {
        fontFamily: 'Inter_500Medium',
        color: COLORS.textLight,
    },
    currentValue: {
        fontFamily: 'Inter_700Bold',
        color: COLORS.primary,
    },
    sectionTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: COLORS.textDark,
        marginBottom: 10,
        marginTop: 5,
    },
    portInput: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    ipCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    ipLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: COLORS.textDark,
        marginBottom: 10,
    },
    ipInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 12,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12,
    },
    ipCardActions: {
        flexDirection: 'row',
        gap: 10,
    },
    testBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#eef2ff',
        padding: 10,
        borderRadius: 10,
    },
    testBtnText: {
        color: COLORS.primary,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
    },
    applyBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 10,
    },
    applyBtnText: {
        color: COLORS.white,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
    },
    statusBox: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    statusText: {
        fontFamily: 'Inter_500Medium',
        color: COLORS.textDark,
        lineHeight: 22,
    },
    saveAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
        marginBottom: 40,
    },
    saveAllBtnText: {
        color: COLORS.white,
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
    },
});
