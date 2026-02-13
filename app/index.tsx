import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { Calculator, BookOpen, Languages, ChevronRight, Sparkles, Star, Zap, Puzzle } from 'lucide-react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function Home() {
    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />

            {/* Hero Gradient Background - Deeper & Richer */}
            <LinearGradient
                colors={['#2563EB', '#3B82F6', '#60A5FA']}
                style={s.heroBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.8 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Header Section */}
                    <View style={s.header}>
                        <View>
                            <Text style={s.greeting}>Hi, 小朋友! 👋</Text>
                            <Text style={s.subGreeting}>今天想挑战什么呢？</Text>
                        </View>
                        <View style={s.headerRight}>
                            <View style={s.starBadge}>
                                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                <Text style={s.starText}>12</Text>
                            </View>
                            <TouchableOpacity style={s.profileBtn}>
                                <View style={s.avatar}>
                                    <Text style={{ fontSize: 24 }}>🧑‍🚀</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content Sections - White Card Layer */}
                    <View style={s.contentLayer}>

                        {/* 1. Math Section */}
                        <Text style={s.sectionHeader}>数学思维</Text>
                        <View style={s.cardContainer}>
                            <GameCard
                                href="/math/arithmetic-defense"
                                title="算术守卫战"
                                subtitle="保护基地，击碎陨石！"
                                icon="🛡️"
                                color="#E0F2FE"
                                accent="#0EA5E9"
                                tag="推荐"
                            />
                            <GameCard
                                href="/math/klotski"
                                title="符文华容道"
                                subtitle="训练逻辑与空间思维"
                                icon="🧩"
                                color="#F0F9FF"
                                accent="#3B82F6"
                            />
                        </View>

                        {/* 2. Chinese Section */}
                        <Text style={s.sectionHeader}>语文素养</Text>
                        <View style={s.cardContainer}>
                            <GameCard
                                href="/chinese/idiom-chain"
                                title="成语接龙"
                                subtitle="与 AI 博士对战成语！"
                                icon="🏮"
                                color="#FEF2F2"
                                accent="#EF4444"
                            />
                            <GameCard
                                href="/chinese/riddle"
                                title="猜字谜"
                                subtitle="寻找隐藏的汉字秘密"
                                icon="📜"
                                color="#FFF7ED"
                                accent="#F97316"
                            />
                        </View>

                        {/* 3. English Section */}
                        <Text style={s.sectionHeader}>英语魔法</Text>
                        <View style={s.cardContainer}>
                            <GameCard
                                href="/word"
                                title="单词大变身"
                                subtitle="念出单词，见证魔法"
                                icon="✨"
                                color="#F0FDFA"
                                accent="#14B8A6"
                                tag="AI"
                            />
                        </View>

                        {/* Footer Info */}
                        <View style={s.footer}>
                            <Sparkles size={14} color="#CBD5E1" style={{ marginRight: 6 }} />
                            <Text style={s.footerText}>AI 学习助手 · 移动端 v2.5</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// Polished Game Card
const GameCard = ({ href, title, subtitle, icon, color, accent, tag }: any) => (
    <Link href={href} asChild>
        <TouchableOpacity style={s.card} activeOpacity={0.7}>
            {/* Icon Box */}
            <View style={[s.cardIcon, { backgroundColor: color }]}>
                <Text style={{ fontSize: 26 }}>{icon}</Text>
            </View>

            {/* Text Content */}
            <View style={s.cardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={s.cardTitle}>{title}</Text>
                    {tag && (
                        <View style={[s.tag, { backgroundColor: tag === 'AI' ? '#8B5CF6' : '#F59E0B' }]}>
                            <Text style={s.tagText}>{tag}</Text>
                        </View>
                    )}
                </View>
                <Text style={s.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
            </View>

            {/* Chevron */}
            <View style={s.chevronBox}>
                <ChevronRight size={18} color="#CBD5E1" />
            </View>
        </TouchableOpacity>
    </Link>
);

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFF6FF' }, // Lighter background
    heroBackground: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 320,
    },
    scrollView: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 28, paddingTop: 60, marginBottom: 24, // Increased top padding for status bar
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    greeting: { fontSize: 30, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
    subGreeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: '500' },

    starBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
    },
    starText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

    profileBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', // Slightly smaller
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8
    },
    avatar: { alignItems: 'center', justifyContent: 'center' },

    // statsWrapper removed

    contentLayer: {
        backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 24, paddingTop: 36, paddingBottom: 60, minHeight: 600, // Increased minHeight
        shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.03, shadowRadius: 16
    },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16, marginLeft: 4, letterSpacing: 0.5 },
    cardContainer: { gap: 16, marginBottom: 36 },

    card: {
        flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, backgroundColor: '#FFFFFF',
        shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    cardIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 18 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
    cardSubtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginTop: 2 },
    chevronBox: { width: 24, alignItems: 'center' },

    tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
    tagText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, opacity: 0.6 },
    footerText: { color: '#64748B', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }
});
