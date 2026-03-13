import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Cairo_700Bold } from '@expo-google-fonts/cairo';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback, useState } from 'react';
import './src/i18n/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initClientFromStorage } from './src/api/client';

ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Cairo_700Bold,
    Tajawal_700Bold,
  });

  // Initialize client with saved IP settings from storage
  useEffect(() => {
    initClientFromStorage();
  }, []);

  // Hide the native expo splash screen once fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (fontError) {
    console.error('Font loading error:', fontError);
    return (
      <View style={styles.container}>
        <Text>Error Loading Fonts: {fontError.message}</Text>
      </View>
    );
  }

  // Show our custom splash while fonts load OR during the splash animation
  if (!fontsLoaded || showSplash) {
    return <SplashScreen onFinish={fontsLoaded ? handleSplashFinish : undefined} />;
  }

  console.log('Rendering AppNavigator');
  try {
    console.log('[App] Rendering Safe Navigator UI');
    return (
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  } catch (error) {
    console.error('[App] Critical rendering error:', error);
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Critical App Error</Text>
        <Text style={{ marginTop: 10 }}>{error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
