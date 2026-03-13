import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

const getStoredLanguage = async () => {
    try {
        const language = await AsyncStorage.getItem('user-language');
        return language || 'fr';
    } catch (error) {
        return 'fr';
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            ar: { translation: ar },
        },
        lng: 'fr', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

// Set language after initialization
const initLanguage = async () => {
    try {
        const lng = await getStoredLanguage();
        await i18n.changeLanguage(lng);

        // Handle RTL safely (primarily for native)
        const isRTL = lng === 'ar';
        if (Platform.OS !== 'web') {
            if (I18nManager.isRTL !== isRTL) {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);
            }
        } else {
            // For web, we might just set document dir
            if (typeof document !== 'undefined') {
                document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
                document.documentElement.lang = lng;
            }
        }
    } catch (error) {
        console.error('Error during i18n post-init:', error);
    }
};

console.log('[i18n] Initializing language system...');
initLanguage();

export default i18n;
