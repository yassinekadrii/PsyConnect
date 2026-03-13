import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

// Floating particle component
const FloatingParticle = ({ delay, startX, startY, size, opacity }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const particleOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const floatAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -30,
                    duration: 3000 + Math.random() * 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 3000 + Math.random() * 2000,
                    useNativeDriver: true,
                }),
            ])
        );

        setTimeout(() => {
            Animated.timing(particleOpacity, {
                toValue: opacity || 0.3,
                duration: 1000,
                useNativeDriver: true,
            }).start();
            floatAnim.start();
        }, delay || 0);

        return () => floatAnim.stop();
    }, []);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: startX,
                    top: startY,
                    width: size || 8,
                    height: size || 8,
                    borderRadius: (size || 8) / 2,
                    opacity: particleOpacity,
                    transform: [{ translateY }],
                },
            ]}
        />
    );
};

export default function SplashScreen({ onFinish }) {
    // Keep a ref to the latest onFinish so the timer closure always has the current value
    const onFinishRef = useRef(onFinish);
    const { t } = useTranslation();
    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    // Animation values
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(20)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(15)).current;
    const pulseScale = useRef(new Animated.Value(0.8)).current;
    const pulseOpacity = useRef(new Animated.Value(0.6)).current;
    const pulse2Scale = useRef(new Animated.Value(0.6)).current;
    const pulse2Opacity = useRef(new Animated.Value(0.4)).current;
    const fadeOut = useRef(new Animated.Value(1)).current;
    const dot1Opacity = useRef(new Animated.Value(0.3)).current;
    const dot2Opacity = useRef(new Animated.Value(0.3)).current;
    const dot3Opacity = useRef(new Animated.Value(0.3)).current;
    const bottomBarWidth = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Logo entrance animation
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();

        // 2. Pulse ring animation (loop)
        const pulseAnim = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseScale, {
                        toValue: 1.8,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseScale, {
                        toValue: 0.8,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(pulseOpacity, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseOpacity, {
                        toValue: 0.6,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        const pulse2Anim = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.delay(500),
                    Animated.timing(pulse2Scale, {
                        toValue: 2.2,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse2Scale, {
                        toValue: 0.6,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.delay(500),
                    Animated.timing(pulse2Opacity, {
                        toValue: 0,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse2Opacity, {
                        toValue: 0.4,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        setTimeout(() => {
            pulseAnim.start();
            pulse2Anim.start();
        }, 300);

        // 3. Subtitle appears
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(subtitleTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 500);

        // 4. Tagline appears
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 900);

        // 5. Loading dots animation
        const dotAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(dot1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(dot1Opacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
                Animated.timing(dot2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(dot2Opacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
                Animated.timing(dot3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(dot3Opacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
            ])
        );
        setTimeout(() => dotAnim.start(), 1000);

        // 6. Progress bar
        Animated.timing(bottomBarWidth, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: false,
        }).start();

        // 7. Fade out after 2.8 seconds and call onFinish
        const exitTimer = setTimeout(() => {
            Animated.timing(fadeOut, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                if (onFinishRef.current) onFinishRef.current();
            });
        }, 2800);

        return () => {
            clearTimeout(exitTimer);
            pulseAnim.stop();
            pulse2Anim.stop();
            dotAnim.stop();
        };
    }, []);

    // Generate particles
    const particles = [
        { delay: 200, startX: width * 0.1, startY: height * 0.15, size: 6, opacity: 0.2 },
        { delay: 400, startX: width * 0.85, startY: height * 0.2, size: 10, opacity: 0.15 },
        { delay: 100, startX: width * 0.25, startY: height * 0.7, size: 8, opacity: 0.25 },
        { delay: 600, startX: width * 0.75, startY: height * 0.65, size: 5, opacity: 0.2 },
        { delay: 300, startX: width * 0.5, startY: height * 0.85, size: 7, opacity: 0.15 },
        { delay: 500, startX: width * 0.15, startY: height * 0.45, size: 9, opacity: 0.2 },
        { delay: 700, startX: width * 0.9, startY: height * 0.5, size: 6, opacity: 0.18 },
        { delay: 350, startX: width * 0.6, startY: height * 0.12, size: 11, opacity: 0.12 },
    ];

    return (
        <Animated.View style={[styles.container, { opacity: fadeOut }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={['#1a1040', '#2d1b69', '#4c1d95', '#3b0d7e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Floating Particles */}
                {particles.map((p, i) => (
                    <FloatingParticle key={i} {...p} />
                ))}

                {/* Decorative circles in background */}
                <View style={[styles.decorCircle, styles.circle1]} />
                <View style={[styles.decorCircle, styles.circle2]} />
                <View style={[styles.decorCircle, styles.circle3]} />

                {/* Center content */}
                <View style={styles.centerContent}>
                    {/* Pulse rings */}
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            {
                                transform: [{ scale: pulseScale }],
                                opacity: pulseOpacity,
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            styles.pulseRing2,
                            {
                                transform: [{ scale: pulse2Scale }],
                                opacity: pulse2Opacity,
                            },
                        ]}
                    />

                    {/* Glow behind text */}
                    <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

                    {/* Main logo text */}
                    <Animated.Text
                        style={[
                            styles.logoText,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }],
                            },
                        ]}
                    >
                        طمئن
                    </Animated.Text>

                    {/* Subtitle */}
                    <Animated.Text
                        style={[
                            styles.subtitleText,
                            {
                                opacity: subtitleOpacity,
                                transform: [{ translateY: subtitleTranslateY }],
                            },
                        ]}
                    >
                        PsyConnect
                    </Animated.Text>

                    {/* Tagline */}
                    <Animated.Text
                        style={[
                            styles.taglineText,
                            {
                                opacity: taglineOpacity,
                                transform: [{ translateY: taglineTranslateY }],
                            },
                        ]}
                    >
                        {t('splash.tagline', 'راحتك النفسية تبدأ من هنا')}
                    </Animated.Text>
                </View>

                {/* Bottom loading section */}
                <View style={styles.bottomSection}>
                    {/* Loading dots */}
                    <View style={styles.dotsContainer}>
                        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
                        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
                        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBarContainer}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: bottomBarWidth.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>

                    {/* Footer */}
                    <Text style={styles.footerText}>{t('common.made_by', 'Made with ❤️ by Yassine Kadri')}</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Floating particles
    particle: {
        position: 'absolute',
        backgroundColor: 'rgba(167, 139, 250, 0.5)',
    },
    // Decorative background circles
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.08)',
    },
    circle1: {
        width: 300,
        height: 300,
        top: -50,
        right: -80,
        borderColor: 'rgba(167, 139, 250, 0.1)',
    },
    circle2: {
        width: 200,
        height: 200,
        bottom: 100,
        left: -60,
        borderColor: 'rgba(236, 72, 153, 0.08)',
    },
    circle3: {
        width: 150,
        height: 150,
        bottom: -30,
        right: 30,
        borderColor: 'rgba(99, 102, 241, 0.1)',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Pulse rings
    pulseRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'rgba(167, 139, 250, 0.4)',
    },
    pulseRing2: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: 'rgba(236, 72, 153, 0.3)',
    },
    // Glow effect
    glow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
    },
    // Main logo
    logoText: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 72,
        color: '#ffffff',
        textShadowColor: 'rgba(139, 92, 246, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
        letterSpacing: 4,
    },
    // Subtitle
    subtitleText: {
        fontSize: 22,
        fontWeight: '300',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 16,
        letterSpacing: 8,
        textTransform: 'uppercase',
    },
    // Tagline
    taglineText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.45)',
        marginTop: 12,
        letterSpacing: 1,
    },
    // Bottom section
    bottomSection: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
        width: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(167, 139, 250, 0.8)',
    },
    progressBarContainer: {
        width: width * 0.5,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: 'rgba(167, 139, 250, 0.6)',
    },
    footerText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.25)',
        letterSpacing: 0.5,
    },
});
