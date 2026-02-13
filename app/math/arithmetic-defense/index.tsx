import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Animated, StyleSheet, Easing, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Heart, Zap, Play, Bomb, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 🎨 Theme Colors - Deep Space & Neon
const THEME = {
    bgStart: '#000000', // Pure Black for Space
    bgEnd: '#0A0A1A',   // Very Deep Blue
    primary: '#00F0FF', // Cyan Neon
    secondary: '#7000FF', // Deep Purple
    accent: '#FF0055',    // Red neon
    gold: '#FBBF24',
    glass: 'rgba(15, 23, 42, 0.4)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
};

interface MeteorData {
    id: number;
    text: string;
    answer: number;
    x: number;
    animY: Animated.Value;
    type: 'normal' | 'fast' | 'boss';
}

interface Particle {
    id: string;
    x: number;
    y: number;
    color: string;
    anim: Animated.Value;
    angle: number;
    speed: number;
}

// ✨ Star Field Background
const StarField = () => {
    // Generate static stars once
    const stars = useRef([...Array(60)].map((_, i) => ({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
    }))).current;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Deep Space Gradient */}
            <LinearGradient colors={[THEME.bgStart, THEME.bgEnd]} style={StyleSheet.absoluteFill} />

            {/* Stars */}
            {stars.map(star => (
                <View
                    key={star.id}
                    style={{
                        position: 'absolute',
                        left: star.x,
                        top: star.y,
                        width: star.size,
                        height: star.size,
                        borderRadius: star.size / 2,
                        backgroundColor: '#FFF',
                        opacity: star.opacity,
                    }}
                />
            ))}
        </View>
    );
};

// 🔮 Energy Core (Input Display) - Updated
const EnergyCore = ({ value }: { value: string }) => (
    <View style={s.coreContainer}>
        <View style={s.coreRing}>
            <View style={s.coreInner}>
                <Text style={s.coreText}>{value || ''}</Text>
                {!value && <View style={s.cursorBlink} />}
            </View>
        </View>
        <View style={s.coreGlow} />
    </View>
);

// 💥 Particle Explosion System
const Explosion = ({ x, y, color, onFinish }: { x: number; y: number; color: string; onFinish: () => void }) => {
    const particles = useRef([...Array(8)].map((_, i) => ({
        id: i.toString(),
        anim: new Animated.Value(0),
        angle: (Math.PI * 2 * i) / 8,
        speed: Math.random() * 0.5 + 0.5
    }))).current;

    useEffect(() => {
        const animations = particles.map(p =>
            Animated.timing(p.anim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad)
            })
        );

        Animated.parallel(animations).start(onFinish);
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
            {particles.map(p => {
                const translateX = p.anim.interpolate({ inputRange: [0, 1], outputRange: [x, x + Math.cos(p.angle) * 100 * p.speed] });
                const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [y, y + Math.sin(p.angle) * 100 * p.speed] });
                const opacity = p.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
                const scale = p.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

                return (
                    <Animated.View key={p.id} style={{
                        position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color,
                        transform: [{ translateX }, { translateY }, { scale }],
                        opacity,
                        shadowColor: color, shadowOpacity: 1, shadowRadius: 5
                    }} />
                );
            })}
        </View>
    );
};

export default function ArithmeticDefense() {
    const router = useRouter();
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [meteors, setMeteors] = useState<MeteorData[]>([]);
    const [explosions, setExplosions] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [combo, setCombo] = useState(0);

    const idRef = useRef(0);
    const meteorTimerRef = useRef<NodeJS.Timeout | null>(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const comboAnim = useRef(new Animated.Value(0)).current;

    // 📳 Haptic Feedback Helper
    const triggerHaptic = (type: 'impact' | 'notification' | 'selection' = 'impact') => {
        if (Platform.OS !== 'web') {
            if (type === 'impact') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            else if (type === 'notification') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            else Haptics.selectionAsync();
        }
    };

    const triggerShake = () => {
        triggerHaptic('notification');
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const triggerCombo = () => {
        setCombo(c => c + 1);
        comboAnim.setValue(0);
        Animated.spring(comboAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    };

    const spawnMeteor = useCallback(() => {
        const level = Math.floor(score / 100);
        // Difficulty curve: 
        // - Numbers get bigger (max 20)
        // - Speed increases (duration decreases)
        // - Spawn rate logic handled in useEffect

        const maxNum = Math.min(20, 10 + level * 2);
        const a = Math.floor(Math.random() * maxNum) + 1;
        const b = Math.floor(Math.random() * maxNum) + 1;
        const ops = ['+', '-'];
        // 20% chance of multiplication at higher levels
        if (level > 2 && Math.random() > 0.8) ops.push('×');

        const op = ops[Math.floor(Math.random() * ops.length)];

        let valA = a, valB = b, finalOp = op;
        if (op === '-' && a < b) { valA = b; valB = a; }
        if (op === '×') { valA = Math.floor(Math.random() * 5) + 2; valB = Math.floor(Math.random() * 5) + 2; }

        let answer = 0;
        if (finalOp === '+') answer = valA + valB;
        else if (finalOp === '-') answer = valA - valB;
        else if (finalOp === '×') answer = valA * valB;

        const id = idRef.current++;
        const animY = new Animated.Value(-100);
        const x = Math.random() * (SCREEN_WIDTH - 100) + 10;

        // Meteor types
        const type = Math.random() > 0.9 ? 'boss' : (Math.random() > 0.7 ? 'fast' : 'normal');

        const meteor: MeteorData = { id, text: `${valA} ${finalOp} ${valB}`, answer, x, animY, type };
        setMeteors(prev => [...prev, meteor]);

        // Duration logic - Much slower for children (Base 12s -> 20s)
        let duration = Math.max(10000, 20000 - level * 1000);
        if (type === 'fast') duration *= 0.8;
        if (type === 'boss') duration *= 1.5;

        Animated.timing(animY, {
            toValue: SCREEN_HEIGHT - 350, // Hit zone above keypad
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setMeteors(prev => prev.filter(m => m.id !== id));
                triggerShake();
                setCombo(0); // Reset combo on hit
                setLives(l => {
                    const next = l - 1;
                    if (next <= 0) setGameState('gameover');
                    return next;
                });
            }
        });
    }, [score]);

    const checkAnswer = (val: string) => {
        setInputValue(val);
        const numericVal = parseInt(val, 10);
        if (isNaN(numericVal)) return;

        const matchingMeteors = meteors.filter(m => m.answer === numericVal);
        const hit = matchingMeteors[0]; // Hit oldest match

        if (hit) {
            hit.animY.stopAnimation(value => {
                const color = hit.type === 'boss' ? THEME.accent : (hit.type === 'fast' ? THEME.gold : THEME.primary);
                setExplosions(prev => [...prev, { id: hit.id, x: hit.x + 40, y: value + 40, color }]);
            });

            triggerHaptic('impact');
            triggerCombo();

            setMeteors(prev => prev.filter(m => m.id !== hit.id));
            setScore(s => s + (hit.type === 'boss' ? 50 : 10) + (combo * 5));
            setInputValue('');
        }
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setMeteors([]);
        setExplosions([]);
        setInputValue('');
        setCombo(0);
        idRef.current = 0;
    };

    useEffect(() => {
        if (gameState === 'playing') {
            spawnMeteor();
            // Spawn interval based on score
            const interval = Math.max(1500, 4000 - Math.floor(score / 50) * 200);
            meteorTimerRef.current = setInterval(spawnMeteor, interval);
        } else {
            if (meteorTimerRef.current) clearInterval(meteorTimerRef.current);
        }
        return () => { if (meteorTimerRef.current) clearInterval(meteorTimerRef.current); };
    }, [gameState, score]); // Re-run when score changes to adjust difficulty

    const handleKey = (key: string | number) => {
        triggerHaptic('selection');
        if (key === 'C') { setInputValue(''); return; }
        if (key === 'del') { setInputValue(prev => prev.slice(0, -1)); return; }

        // Auto clear if length > 3 to prevent stuck
        if (inputValue.length >= 3) {
            checkAnswer(String(key));
            return;
        }

        const next = inputValue + key;
        checkAnswer(next);
    };

    // ─── Menu Screen ───
    if (gameState === 'menu') {
        return (
            <LinearGradient colors={[THEME.bgStart, THEME.bgEnd]} style={s.container}>
                <StatusBar barStyle="light-content" />
                <View style={s.centerContent}>
                    <View style={[s.menuIconRing, { borderColor: THEME.primary }]}>
                        <Zap size={64} color={THEME.primary} />
                    </View>
                    <Text style={s.gameTitle}>星际防御者</Text>
                    <Text style={s.gameSubtitle}>算术守卫战 V2</Text>

                    <TouchableOpacity onPress={startGame} style={s.startBtn} activeOpacity={0.8}>
                        <LinearGradient colors={[THEME.primary, THEME.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.gradientBtn}>
                            <Play size={24} color="white" fill="white" />
                            <Text style={s.startBtnText}>开始任务</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // ─── Game Over Screen ───
    if (gameState === 'gameover') {
        return (
            <LinearGradient colors={['#2A0F1B', '#0F172A']} style={s.container}>
                <View style={s.centerContent}>
                    <Bomb size={80} color={THEME.accent} style={{ marginBottom: 20 }} />
                    <Text style={s.gameOverText}>任务失败</Text>
                    <Text style={s.finalScore}>最终得分: {score}</Text>
                    <TouchableOpacity onPress={startGame} style={s.startBtn} activeOpacity={0.8}>
                        <LinearGradient colors={[THEME.accent, '#FF5500']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.gradientBtn}>
                            <Text style={s.startBtnText}>再次挑战</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // ─── Playing Screen ───
    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <StarField />

            <Animated.View style={[s.visualLayer, { transform: [{ translateX: shakeAnim }, { translateY: shakeAnim }] }]}>
                {/* Header HUD - Compact */}
                <SafeAreaView>
                    <View style={s.hudContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={s.glassBtn}>
                            <ArrowLeft size={20} color="#FFF" />
                        </TouchableOpacity>

                        <View style={s.scoreObj}>
                            <Text style={s.hudLabel}>SCORE</Text>
                            <Text style={s.hudScore}>{score}</Text>
                        </View>

                        <View style={s.livesContainer}>
                            {[0, 1, 2].map(i => (
                                <Heart key={i} size={20} color={i < lives ? THEME.accent : 'rgba(255,255,255,0.1)'} fill={i < lives ? THEME.accent : 'transparent'} />
                            ))}
                        </View>
                    </View>
                </SafeAreaView>

                {/* Game Canvas */}
                <View style={s.canvas}>
                    {/* Combo Indicator */}
                    {combo > 1 && (
                        <Animated.View style={[s.comboContainer, { opacity: comboAnim, transform: [{ scale: comboAnim }] }]}>
                            <Text style={s.comboText}>{combo} COMBO!</Text>
                        </Animated.View>
                    )}

                    {/* Meteors */}
                    {meteors.map(m => (
                        <Animated.View key={m.id} style={[s.meteor, { left: m.x, transform: [{ translateY: m.animY }] }]}>
                            <BlurView intensity={10} tint="dark" style={[s.meteorGlass, m.type === 'boss' && s.bossMeteor]}>
                                <Text style={s.meteorText}>{m.text}</Text>
                            </BlurView>
                        </Animated.View>
                    ))}

                    {/* Explosions */}
                    {explosions.map(ex => (
                        <Explosion key={ex.id} x={ex.x} y={ex.y} color={ex.color} onFinish={() => setExplosions(prev => prev.filter(e => e.id !== ex.id))} />
                    ))}
                </View>

                {/* Energy Core (Replaces Turret) */}
                <View style={s.turretContainer}>
                    <EnergyCore value={inputValue} />
                </View>
            </Animated.View>

            {/* Glassmorphism Keypad - Compact */}
            <BlurView intensity={30} tint="dark" style={s.keypadContainer}>
                <View style={s.keypadGrid}>
                    {[1, 2, 3].map(n => <KeyButton key={n} val={n} onPress={handleKey} />)}
                    {[4, 5, 6].map(n => <KeyButton key={n} val={n} onPress={handleKey} />)}
                    {[7, 8, 9].map(n => <KeyButton key={n} val={n} onPress={handleKey} />)}
                    <KeyButton val="C" onPress={handleKey} type="action" />
                    <KeyButton val="0" onPress={handleKey} />
                    <KeyButton val="del" onPress={handleKey} type="action" icon={<X size={20} color="#FFF" />} />
                </View>
            </BlurView>

        </View>
    );
}

// Compact Key Button
const KeyButton = ({ val, onPress, type, icon }: { val: string | number, onPress: (v: string | number) => void, type?: 'action', icon?: React.ReactNode }) => (
    <TouchableOpacity
        style={[s.keyBtn, type === 'action' && s.keyBtnAction]}
        onPress={() => onPress(val)}
        activeOpacity={0.7}
    >
        {icon ? icon : <Text style={[s.keyText, type === 'action' && s.keyTextAction]}>{val}</Text>}
    </TouchableOpacity>
);

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    visualLayer: { flex: 1 },
    centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Menu
    menuIconRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderColor: THEME.primary, shadowColor: THEME.primary, shadowOpacity: 0.5, shadowRadius: 20 },
    gameTitle: { fontSize: 40, fontWeight: '900', color: '#FFF', letterSpacing: 1, textShadowColor: THEME.primary, textShadowRadius: 10 },
    gameSubtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 40, letterSpacing: 3, textTransform: 'uppercase' },
    startBtn: { borderRadius: 30, overflow: 'hidden' },
    gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16 },
    startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800', marginLeft: 8 },

    // Game Over
    gameOverText: { fontSize: 32, fontWeight: '900', color: THEME.accent, marginBottom: 8 },
    finalScore: { fontSize: 20, color: '#FFF', marginBottom: 32, opacity: 0.9 },

    // HUD
    hudContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, zIndex: 10 },
    glassBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.glassBorder, alignItems: 'center', justifyContent: 'center' },
    scoreObj: { alignItems: 'center' },
    hudLabel: { color: THEME.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    hudScore: { color: '#FFF', fontSize: 24, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    livesContainer: { flexDirection: 'row', gap: 4 },

    // Canvas
    canvas: { flex: 1, position: 'relative' },
    comboContainer: { position: 'absolute', top: '15%', alignSelf: 'center', zIndex: 20 },
    comboText: { fontSize: 32, fontWeight: '900', color: THEME.gold, fontStyle: 'italic', textShadowColor: THEME.secondary, textShadowRadius: 10 },

    // Meteor
    meteor: { position: 'absolute', width: 80, alignItems: 'center' },
    meteorGlass: {
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)'
    },
    bossMeteor: { borderColor: THEME.accent, transform: [{ scale: 1.1 }] },
    meteorText: { color: '#FFF', fontSize: 16, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

    // Energy Core
    turretContainer: { position: 'absolute', bottom: 250, left: 0, right: 0, alignItems: 'center', zIndex: 5 }, // Adjusted bottom
    coreContainer: { alignItems: 'center', justifyContent: 'center', width: 80, height: 80 },
    coreRing: {
        width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: THEME.primary,
        alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 240, 255, 0.1)'
    },
    coreInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' },
    coreText: { color: '#FFF', fontSize: 24, fontWeight: '900', textShadowColor: THEME.primary, textShadowRadius: 10 },
    coreGlow: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: THEME.primary, opacity: 0.3 },
    cursorBlink: { width: 2, height: 20, backgroundColor: THEME.primary },

    // Keypad - Miniaturized
    keypadContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden',
        paddingHorizontal: 16, paddingBottom: 30, paddingTop: 16, // Reduced padding
        backgroundColor: 'rgba(15, 23, 42, 0.8)'
    },
    keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }, // Decreased gap
    keyBtn: {
        width: (SCREEN_WIDTH - 56) / 3, height: 48, borderRadius: 12, // Reduced height (64 -> 48)
        backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    keyBtnAction: { backgroundColor: 'rgba(255,0,85,0.15)', borderColor: 'rgba(255,0,85,0.2)' },
    keyText: { color: '#FFF', fontSize: 20, fontWeight: '600' }, // Smaller font
    keyTextAction: { color: '#FFB8C0' },
});
