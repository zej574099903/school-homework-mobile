import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { ArrowLeft, Sparkles, HelpCircle, Lightbulb, CheckCircle2, XCircle, Wand2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../utils/api';

export default function GuessingRiddle() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [riddle, setRiddle] = useState<any>(null);
    const [input, setInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [hintsRevealed, setHintsRevealed] = useState(0);

    const fetchRiddle = async () => {
        setLoading(true);
        setRiddle(null);
        setInput('');
        setIsCorrect(false);
        setShowAnswer(false);
        setHintsRevealed(0);
        try {
            const res = await api.chinese.riddle({ grade: '二年级' });
            setRiddle(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('魔法失效', '大师正在闭关，请稍后再试 🧙‍♂️');
        } finally {
            setLoading(false);
        }
    };

    const handleGuess = () => {
        if (!input.trim()) return;

        // Simple fuzzy match: remove punctuation and spaces
        const normalize = (str: string) => str.replace(/[.,，。 \s]/g, '');
        const userAns = normalize(input);
        const correctAns = normalize(riddle.answer);

        if (userAns === correctAns) {
            setIsCorrect(true);
            setShowAnswer(true);
            Keyboard.dismiss();
        } else {
            Alert.alert('猜错啦', '不对哦，再动动脑筋！🤔');
            setInput('');
        }
    };

    const handleReveal = () => {
        Alert.alert(
            '揭晓谜底',
            '确定要放弃挑战直接看答案吗？',
            [
                { text: '再想想', style: 'cancel' },
                {
                    text: '看答案',
                    style: 'destructive',
                    onPress: () => {
                        setShowAnswer(true);
                        Keyboard.dismiss();
                    }
                }
            ]
        );
    };

    const getNextHint = () => {
        if (hintsRevealed < riddle?.hints?.length) {
            setHintsRevealed(prev => prev + 1);
        } else {
            Alert.alert('提示', '大师已经没有更多提示啦！');
        }
    };

    return (
        <View style={s.container}>
            <LinearGradient colors={['#FDFCFB', '#F3EFE0']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={s.flex1}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <ArrowLeft size={24} color="#5D4037" />
                    </TouchableOpacity>
                    <View style={s.headerTitleContainer}>
                        <Text style={s.headerTitle}>猜字谜大师</Text>
                        <View style={s.badge}>
                            <Text style={s.badgeText}>教育版</Text>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={s.flex1}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                        {!riddle && !loading && (
                            <View style={s.startBox}>
                                <View style={s.masterAvatar}>
                                    <Text style={s.masterEmoji}>🧙‍♂️</Text>
                                </View>
                                <Text style={s.startTitle}>字谜挑战</Text>
                                <Text style={s.startDesc}>动动脑筋，猜猜我是谁？</Text>
                                <TouchableOpacity onPress={fetchRiddle} style={s.mainBtn}>
                                    <Sparkles size={20} color="white" />
                                    <Text style={s.mainBtnText}>开始挑战</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {loading && (
                            <View style={s.loadingBox}>
                                <ActivityIndicator size="large" color="#8D6E63" />
                                <Text style={s.loadingText}>大师正在出题中...</Text>
                            </View>
                        )}

                        {riddle && !loading && (
                            <View style={s.gameContainer}>
                                {/* Riddle Card */}
                                <View style={s.riddleCard}>
                                    <View style={s.cardHeader}>
                                        <Wand2 size={20} color="#8D6E63" />
                                        <Text style={s.cardLabel}>谜面</Text>
                                    </View>
                                    <Text style={s.riddleText}>{riddle.riddle}</Text>
                                </View>

                                {/* Input & Interaction Area */}
                                {!showAnswer ? (
                                    <View style={s.interactionArea}>
                                        <View style={s.inputRow}>
                                            <TextInput
                                                style={s.input}
                                                placeholder="输入你的答案..."
                                                placeholderTextColor="#A1887F"
                                                value={input}
                                                onChangeText={setInput}
                                                maxLength={10}
                                                returnKeyType="done"
                                                onSubmitEditing={handleGuess}
                                            />
                                            <TouchableOpacity onPress={handleGuess} style={[s.guessBtn, !input.trim() && s.guessBtnDisabled]}>
                                                <Text style={s.guessBtnText}>猜！</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={s.actionRow}>
                                            <TouchableOpacity onPress={getNextHint} style={s.actionBtn}>
                                                <Lightbulb size={18} color="#F59E0B" />
                                                <Text style={[s.actionText, { color: '#F59E0B' }]}>
                                                    求提示 ({hintsRevealed}/{riddle.hints.length})
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={handleReveal} style={s.actionBtn}>
                                                <HelpCircle size={18} color="#A1887F" />
                                                <Text style={[s.actionText, { color: '#A1887F' }]}>看答案</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Hints Display */}
                                        {hintsRevealed > 0 && (
                                            <View style={s.hintsContainer}>
                                                {riddle.hints.slice(0, hintsRevealed).map((hint: string, i: number) => (
                                                    <View key={i} style={s.hintItem}>
                                                        <Lightbulb size={14} color="#D97706" style={{ marginTop: 2 }} />
                                                        <Text style={s.hintText}>{hint}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={s.resultBox}>
                                        {isCorrect ? (
                                            <View style={s.correctBadge}>
                                                <CheckCircle2 size={24} color="#FFF" />
                                                <Text style={s.correctText}>答对啦！</Text>
                                            </View>
                                        ) : (
                                            <View style={s.revealBadge}>
                                                <HelpCircle size={24} color="#FFF" />
                                                <Text style={s.revealText}>谜底揭晓</Text>
                                            </View>
                                        )}

                                        <View style={s.answerCard}>
                                            <Text style={s.answerChar}>{riddle.answer}</Text>
                                            <Text style={s.answerPinyin}>{riddle.pinyin}</Text>
                                            <View style={s.divider} />
                                            <Text style={s.explanationText}>{riddle.explanation}</Text>
                                        </View>

                                        <TouchableOpacity onPress={fetchRiddle} style={s.nextBtn}>
                                            <Sparkles size={20} color="#FFF" />
                                            <Text style={s.nextBtnText}>再猜一个</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#3E2723' },
    badge: { backgroundColor: '#8D6E63', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    startBox: { alignItems: 'center', marginTop: 100, backgroundColor: 'rgba(255,255,255,0.6)', padding: 40, borderRadius: 30, borderWidth: 1, borderColor: '#EFEBE9' },
    masterAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFEBE9', alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#5D4037', shadowOpacity: 0.1, shadowRadius: 10 },
    masterEmoji: { fontSize: 40 },
    startTitle: { fontSize: 24, fontWeight: '900', color: '#3E2723', marginBottom: 8 },
    startDesc: { fontSize: 16, color: '#8D6E63', marginBottom: 30 },
    mainBtn: { backgroundColor: '#5D4037', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, shadowColor: '#5D4037', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    mainBtnText: { color: 'white', fontSize: 18, fontWeight: '900', marginLeft: 10 },

    loadingBox: { alignItems: 'center', marginTop: 120 },
    loadingText: { color: '#8D6E63', fontWeight: 'bold', marginTop: 16 },

    gameContainer: { marginTop: 20 },

    riddleCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#D7CCC8', shadowColor: '#5D4037', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, opacity: 0.6 },
    cardLabel: { fontSize: 14, fontWeight: 'bold', color: '#5D4037', marginLeft: 6 },
    riddleText: { fontSize: 26, fontWeight: '900', color: '#3E2723', lineHeight: 40, textAlign: 'center' },

    interactionArea: { width: '100%' },
    inputRow: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#FFF', height: 50, borderRadius: 25, paddingHorizontal: 20, fontSize: 18, color: '#3E2723', borderWidth: 1, borderColor: '#D7CCC8', fontWeight: 'bold' },
    guessBtn: { width: 80, height: 50, backgroundColor: '#5D4037', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginLeft: 12, shadowColor: '#5D4037', shadowOpacity: 0.2, shadowRadius: 4 },
    guessBtnDisabled: { backgroundColor: '#D7CCC8' },
    guessBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    actionText: { fontSize: 14, fontWeight: 'bold', marginLeft: 6 },

    hintsContainer: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16, padding: 16 },
    hintItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    hintText: { flex: 1, fontSize: 14, color: '#B45309', marginLeft: 8, lineHeight: 20 },

    resultBox: { alignItems: 'center', width: '100%' },
    correctBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 20 },
    correctText: { color: '#FFF', fontSize: 18, fontWeight: '900', marginLeft: 8 },
    revealBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#A1887F', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 20 },
    revealText: { color: '#FFF', fontSize: 18, fontWeight: '900', marginLeft: 8 },

    answerCard: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#D7CCC8', marginBottom: 24 },
    answerChar: { fontSize: 60, fontWeight: '900', color: '#3E2723', marginBottom: 4 },
    answerPinyin: { fontSize: 18, color: '#8D6E63', fontStyle: 'italic', marginBottom: 16 },
    divider: { width: '100%', height: 1, backgroundColor: '#F5F5F5', marginBottom: 16 },
    explanationText: { fontSize: 15, color: '#5D4037', lineHeight: 24, textAlign: 'center' },

    nextBtn: { backgroundColor: '#5D4037', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 25, shadowColor: '#5D4037', shadowOpacity: 0.2, shadowRadius: 8 },
    nextBtnText: { color: 'white', fontSize: 18, fontWeight: '900', marginLeft: 8 },
});
