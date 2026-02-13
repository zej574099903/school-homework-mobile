import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { ArrowLeft, Sparkles, Volume2, Wand2, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../utils/api';

export default function WordTransformation() {
    const router = useRouter();
    const [term, setTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const speak = (text: string) => {
        Speech.speak(text, { language: 'en-US', rate: 0.9, pitch: 1.0 });
    };

    const handleTransform = async () => {
        if (!term.trim()) return;
        Keyboard.dismiss();
        setLoading(true);
        try {
            const res = await api.word.transform(term.trim());
            const data = res.data;
            setResult(data);
            // Auto-play word
            if (data.word) speak(data.word);
        } catch (error) {
            console.error(error);
            alert('魔法感应失败，请检查网络后再试 😢');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <LinearGradient colors={['#F0FDFA', '#CCFBF1']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={s.flex1}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={s.flex1}
                >
                    <View style={s.inner}>
                        {/* Header */}
                        <View style={s.header}>
                            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                                <ArrowLeft size={24} color="#0F766E" />
                            </TouchableOpacity>
                            <View style={s.headerTitleContainer}>
                                <Text style={s.headerTitle}>单词大变身</Text>
                                <View style={s.badge}>
                                    <Text style={s.badgeText}>AI 魔法</Text>
                                </View>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                            {/* Intro/Input Area */}
                            <View style={s.inputCard}>
                                <View style={s.inputHeader}>
                                    <Wand2 size={20} color="#14B8A6" />
                                    <Text style={s.inputLabel}>输入单词，施展魔法</Text>
                                </View>

                                <View style={s.inputBox}>
                                    <TextInput
                                        style={s.textInput}
                                        placeholder="例如: Tiger"
                                        placeholderTextColor="#94A3B8"
                                        value={term}
                                        onChangeText={setTerm}
                                        onSubmitEditing={handleTransform}
                                        returnKeyType="search"
                                    />
                                    <TouchableOpacity
                                        onPress={handleTransform}
                                        disabled={loading || !term.trim()}
                                        style={[s.magicBtn, (!term.trim() || loading) && s.magicBtnDisabled]}
                                    >
                                        {loading ? <ActivityIndicator color="white" size="small" /> : <Sparkles size={20} color="white" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Results */}
                            {result && !loading && (
                                <View style={s.resultContainer}>
                                    {/* Main Card */}
                                    <View style={s.resultCard}>
                                        <Text style={s.bigEmoji}>{result.emoji}</Text>

                                        <View style={s.wordRow}>
                                            <View>
                                                <Text style={s.resultWord}>{result.word}</Text>
                                                <Text style={s.resultMeaning}>{result.meaning}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => speak(result.word)} style={s.speakBtnBig}>
                                                <Volume2 size={32} color="#0D9488" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Sentence Section */}
                                        <View style={s.sentenceBox}>
                                            <View style={s.sentenceHeader}>
                                                <BookOpen size={16} color="#5EEAD4" />
                                                <Text style={s.sentenceLabel}>例句魔法</Text>
                                                <TouchableOpacity onPress={() => speak(result.sentence)} style={s.speakBtnSmall}>
                                                    <Volume2 size={16} color="#0D9488" />
                                                    <Text style={s.speakText}>朗读</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={s.sentenceText}>{result.sentence}</Text>
                                        </View>
                                    </View>

                                    {/* Scene Card */}
                                    <View style={s.sceneCard}>
                                        <Text style={s.sceneTitle}>🔮 魔法场景</Text>
                                        <Text style={s.sceneText}>{result.scene}</Text>
                                    </View>
                                </View>
                            )}

                            {!result && !loading && (
                                <View style={s.placeholder}>
                                    <View style={s.placeholderIcon}>
                                        <Sparkles size={40} color="#CCFBF1" />
                                    </View>
                                    <Text style={s.placeholderText}>等待魔法释放...</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: 24 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#134E4A' },
    badge: { backgroundColor: '#5EEAD4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
    badgeText: { color: '#134E4A', fontSize: 10, fontWeight: 'bold' },

    scrollContent: { paddingBottom: 40, paddingTop: 10 },

    inputCard: {
        backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, marginBottom: 24,
        shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        borderWidth: 1, borderColor: '#F0FDFA'
    },
    inputHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    inputLabel: { color: '#0F766E', fontWeight: '700', fontSize: 15 },

    inputBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDFA',
        borderRadius: 20, padding: 6, borderWidth: 1, borderColor: '#CCFBF1'
    },
    textInput: {
        flex: 1, paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 18, fontWeight: '600', color: '#134E4A'
    },
    magicBtn: {
        width: 44, height: 44, backgroundColor: '#14B8A6', borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4
    },
    magicBtnDisabled: { backgroundColor: '#99F6E4', shadowOpacity: 0 },

    resultContainer: { gap: 20 },

    resultCard: {
        backgroundColor: '#FFFFFF', borderRadius: 32, padding: 28,
        shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20,
        borderWidth: 1, borderColor: '#F0FDFA', position: 'relative', overflow: 'hidden'
    },
    bigEmoji: { position: 'absolute', top: -10, right: -10, fontSize: 100, opacity: 0.08 },

    wordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    resultWord: { fontSize: 40, fontWeight: '900', color: '#134E4A', marginBottom: 4 },
    resultMeaning: { fontSize: 22, fontWeight: '700', color: '#0D9488' },
    speakBtnBig: {
        width: 60, height: 60, backgroundColor: '#F0FDFA', borderRadius: 30,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CCFBF1'
    },

    sentenceBox: {
        backgroundColor: '#F0FDFA', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: '#CCFBF1'
    },
    sentenceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sentenceLabel: { fontSize: 13, fontWeight: '800', color: '#14B8A6', marginLeft: 6, flex: 1 },
    speakBtnSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    speakText: { fontSize: 12, fontWeight: '700', color: '#0F766E', marginLeft: 4 },
    sentenceText: { fontSize: 18, color: '#115E59', lineHeight: 28, fontWeight: '500', fontStyle: 'italic' },

    sceneCard: {
        backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 24, padding: 24,
        borderWidth: 1, borderColor: '#E6FFFA'
    },
    sceneTitle: { fontSize: 16, fontWeight: '800', color: '#0F766E', marginBottom: 12 },
    sceneText: { fontSize: 15, color: '#134E4A', lineHeight: 24 },

    placeholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    placeholderIcon: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0FDFA',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16
    },
    placeholderText: { color: '#99F6E4', fontWeight: '700', fontSize: 16 },
});
