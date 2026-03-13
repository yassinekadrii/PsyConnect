import React from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';

const Input = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
});

export default Input;
