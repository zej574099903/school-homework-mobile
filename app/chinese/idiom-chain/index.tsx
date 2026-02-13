import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { ArrowLeft, Send, GraduationCap, BookOpen, Sparkles, Lightbulb, CircleAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../utils/api';

interface Message {
    role: 'user' | 'ai';
    content: string;
    pinyin?: string;
    meaning?: string;
    status?: 'success' | 'error';
    isHint?: boolean;
}

export default function IdiomChain() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: '一心一意',
            pinyin: 'yī xīn yī yì',
            meaning: '形容心思集中，专心致志。',
            status: 'success'
        }
    ]);
    const scrollViewRef = useRef<ScrollView>(null);

    // Helper: Get valid idioms only
    const getLastValidIdiom = () => {
        const validMsgs = [...messages].reverse().filter(m => m.role === 'ai' && m.status === 'success' && !m.isHint);
        return validMsgs[0]?.content || '开始';
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        const lastIdiom = getLastValidIdiom();
        const lastChar = lastIdiom.slice(-1);

        // 1. Frontend Validation: Strict Character Match
        if (lastIdiom !== '开始' && userMsg[0] !== lastChar) {
            Alert.alert('接错啦！', `上一个字是“${lastChar}”，你需要用“${lastChar}”开头哦！`);
            return;
        }

        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await api.chinese.idiomChain({
                word: userMsg,
                lastWord: lastIdiom,
                grade: '二年级',
                type: 'play'
            });

            const data = res.data;
            setMessages([...newMessages, {
                role: 'ai',
                content: data.next_idiom || data.error || '出错了',
                pinyin: data.pinyin,
                meaning: data.meaning,
                status: data.status || 'error'
            }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'ai', content: '网络开小差了，请重试一下。', status: 'error' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleHint = async () => {
        if (loading) return;
        setLoading(true);
        const lastIdiom = getLastValidIdiom();

        try {
            const res = await api.chinese.idiomChain({
                word: '',
                lastWord: lastIdiom,
                grade: '二年级',
                type: 'hint'
            });

            const data = res.data;
            if (data.next_idiom) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: `💡 提示：试试“${data.next_idiom}”？`,
                    pinyin: data.pinyin,
                    meaning: data.meaning,
                    status: 'success',
                    isHint: true
                }]);
            }
        } catch (error) {
            Alert.alert('提示失败', '博士暂时也想不出来啦！');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <LinearGradient colors={['#FDFCFB', '#F3EFE0']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={s.flex1}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={s.flex1}
                >
                    <View style={s.inner}>
                        {/* Header */}
                        <View style={s.header}>
                            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                                <ArrowLeft size={24} color="#5D4037" />
                            </TouchableOpacity>
                            <View style={s.headerTitleContainer}>
                                <Text style={s.headerTitle}>成语接龙</Text>
                                <View style={s.badge}>
                                    <Text style={s.badgeText}>教育版</Text>
                                </View>
                            </View>
                        </View>

                        {/* Intro Card */}
                        <View style={s.introBox}>
                            <Text style={s.introText}>
                                规则：接龙必须<Text style={{ fontWeight: 'bold' }}>首尾同字</Text>哦！{"\n"}
                                遇到困难可以点击右下角的灯泡💡求助。
                            </Text>
                        </View>

                        {/* Chat Scroll */}
                        <ScrollView
                            ref={scrollViewRef}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                            style={s.flex1}
                            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.map((msg, index) => (
                                <View key={index} style={[s.msgRow, msg.role === 'user' ? s.msgRowRight : s.msgRowLeft]}>
                                    {msg.role === 'ai' && (
                                        <View style={s.aiAvatar}>
                                            <GraduationCap size={20} color="#FFF" />
                                        </View>
                                    )}
                                    <View style={[
                                        s.bubble,
                                        msg.role === 'user' ? s.bubbleUser : s.bubbleAi,
                                        msg.status === 'error' && s.bubbleError,
                                        msg.isHint && s.bubbleHint
                                    ]}>
                                        {msg.role === 'ai' && msg.status !== 'error' && !msg.isHint ? (
                                            <View>
                                                <Text style={s.idiomText}>{msg.content}</Text>
                                                {msg.pinyin && <Text style={s.pinyinText}>[{msg.pinyin}]</Text>}
                                                <View style={s.divider} />
                                                <View style={s.meaningRow}>
                                                    <BookOpen size={12} color="#8D6E63" style={{ marginRight: 4, marginTop: 2 }} />
                                                    <Text style={s.meaningText}>{msg.meaning}</Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <Text style={[
                                                s.bubbleText,
                                                msg.role === 'user' ? s.textWhite : s.textDark,
                                                msg.isHint && { color: '#D97706' }
                                            ]}>
                                                {msg.content}
                                                {msg.isHint && msg.meaning && `\n\n解释：${msg.meaning}`}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                            {loading && (
                                <View style={[s.msgRow, s.msgRowLeft]}>
                                    <View style={s.aiAvatar}><GraduationCap size={20} color="#FFF" /></View>
                                    <View style={[s.bubble, s.bubbleAi, s.loadingBubble]}>
                                        <ActivityIndicator color="#8D6E63" size="small" />
                                        <Text style={s.loadingText}>博士思考中...</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={s.inputArea}>
                            <View style={s.inputBox}>
                                <TextInput
                                    style={s.textInput}
                                    placeholder="输入成语..."
                                    placeholderTextColor="#A1887F"
                                    value={input}
                                    onChangeText={setInput}
                                    onSubmitEditing={handleSend}
                                    returnKeyType="send"
                                />
                                <TouchableOpacity
                                    onPress={handleSend}
                                    disabled={loading || !input.trim()}
                                    style={[s.sendBtn, input.trim() ? s.sendBtnActive : s.sendBtnInactive]}
                                >
                                    <Send size={18} color={input.trim() ? 'white' : '#D7CCC8'} />
                                </TouchableOpacity>
                            </View>

                            {/* Hint Button */}
                            <TouchableOpacity
                                onPress={handleHint}
                                disabled={loading}
                                style={s.hintBtn}
                            >
                                <Lightbulb size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#3E2723' },
    badge: { backgroundColor: '#8D6E63', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    introBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(93, 64, 55, 0.1)' },
    introText: { fontSize: 13, color: '#5D4037', lineHeight: 18, textAlign: 'center' },

    msgRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
    msgRowLeft: { justifyContent: 'flex-start' },
    msgRowRight: { justifyContent: 'flex-end' },

    aiAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#5D4037', alignItems: 'center', justifyContent: 'center', marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },

    bubble: { maxWidth: '85%', padding: 16, borderRadius: 24, shadowColor: '#5D4037', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
    bubbleUser: { backgroundColor: '#5D4037', borderTopRightRadius: 4 },
    bubbleAi: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#EFEBE9' },
    bubbleError: { backgroundColor: '#FFF5F5', borderColor: '#FED7D7' },
    bubbleHint: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },

    idiomText: { fontSize: 24, fontWeight: '900', color: '#3E2723', textAlign: 'center', marginBottom: 4 },
    pinyinText: { fontSize: 14, color: '#A1887F', textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },
    meaningRow: { flexDirection: 'row', alignItems: 'flex-start' },
    meaningText: { flex: 1, fontSize: 14, color: '#5D4037', lineHeight: 20 },

    bubbleText: { fontSize: 16, lineHeight: 24 },
    textWhite: { color: '#FFFFFF', fontWeight: '800' },
    textDark: { color: '#3E2723' },

    loadingBubble: { padding: 12, minWidth: 60, alignItems: 'center' },
    loadingText: { fontSize: 12, color: '#8D6E63', marginTop: 4 },

    inputArea: { paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
    inputBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 30,
        paddingHorizontal: 20, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
        borderWidth: 1, borderColor: '#D7CCC8'
    },
    textInput: { flex: 1, color: '#3E2723', fontSize: 18, fontWeight: '600' },
    sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
    sendBtnActive: { backgroundColor: '#5D4037' },
    sendBtnInactive: { backgroundColor: '#EFEBE9' },

    hintBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#F59E0B',
        alignItems: 'center', justifyContent: 'center', marginLeft: 10,
        shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4
    },
});
