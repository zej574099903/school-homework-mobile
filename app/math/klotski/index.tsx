import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Alert, StyleSheet } from 'react-native';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 3;
const TILE_GAP = 6;
const BOARD_PADDING = 12;
const TILE_SIZE = (SCREEN_WIDTH - 48 - BOARD_PADDING * 2 - TILE_GAP * (GRID_SIZE - 1)) / GRID_SIZE;

export default function MagicKlotski() {
    const router = useRouter();
    const [tiles, setTiles] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);

    const initGame = () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        for (let i = 0; i < 200; i++) {
            const neighbors = getNeighbors(arr.indexOf(0));
            const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
            arr = swap(arr, arr.indexOf(0), pick);
        }
        setTiles(arr);
        setMoves(0);
    };

    const getNeighbors = (index: number) => {
        const n: number[] = [];
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        if (row > 0) n.push(index - GRID_SIZE);
        if (row < GRID_SIZE - 1) n.push(index + GRID_SIZE);
        if (col > 0) n.push(index - 1);
        if (col < GRID_SIZE - 1) n.push(index + 1);
        return n;
    };

    const swap = (arr: number[], i: number, j: number) => {
        const copy = [...arr];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        return copy;
    };

    const handlePress = (index: number) => {
        const emptyIdx = tiles.indexOf(0);
        if (getNeighbors(emptyIdx).includes(index)) {
            const next = swap(tiles, index, emptyIdx);
            setTiles(next);
            setMoves(m => m + 1);
            if (checkWin(next)) {
                Alert.alert('祝贺你！🎉', `你只用了 ${moves + 1} 步就解开了符文！`, [{ text: '再来一局', onPress: initGame }]);
            }
        }
    };

    const checkWin = (arr: number[]) => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== i + 1) return false;
        }
        return true;
    };

    useEffect(() => { initGame(); }, []);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.inner}>
                {/* Header */}
                <View style={s.header}>
                    <View style={s.headerLeft}>
                        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                            <ArrowLeft size={24} color="#1E293B" />
                        </TouchableOpacity>
                        <Text style={s.headerTitle}>符文华容道</Text>
                    </View>
                    <TouchableOpacity onPress={initGame} style={s.refreshBtn}>
                        <RefreshCw size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={s.statsRow}>
                    <View style={s.statsBadge}>
                        <Trophy size={16} color="#3B82F6" />
                        <Text style={s.statsText}>步数: {moves}</Text>
                    </View>
                </View>

                {/* Board */}
                <View style={s.boardWrapper}>
                    <View style={s.board}>
                        {tiles.map((tile, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handlePress(index)}
                                disabled={tile === 0}
                                style={[
                                    s.tile,
                                    tile === 0 && s.tileEmpty,
                                    {
                                        left: (index % GRID_SIZE) * (TILE_SIZE + TILE_GAP),
                                        top: Math.floor(index / GRID_SIZE) * (TILE_SIZE + TILE_GAP),
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                {tile !== 0 && <Text style={s.tileText}>{tile}</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={s.hintContainer}>
                    <Text style={s.hintText}>
                        点击与空白格相邻的符文块进行移动，将它们按 1-8 的顺序排列好！
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    inner: { flex: 1, paddingHorizontal: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginLeft: 8 },
    refreshBtn: {
        width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
    },
    statsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
    statsBadge: {
        backgroundColor: '#EFF6FF', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#DBEAFE', flexDirection: 'row', alignItems: 'center',
    },
    statsText: { color: '#2563EB', fontWeight: '700', marginLeft: 8 },
    boardWrapper: { alignItems: 'center', justifyContent: 'center' },
    board: {
        width: GRID_SIZE * TILE_SIZE + (GRID_SIZE - 1) * TILE_GAP + BOARD_PADDING * 2,
        height: GRID_SIZE * TILE_SIZE + (GRID_SIZE - 1) * TILE_GAP + BOARD_PADDING * 2,
        backgroundColor: '#E2E8F0', borderRadius: 28, padding: BOARD_PADDING,
        position: 'relative',
    },
    tile: {
        position: 'absolute',
        width: TILE_SIZE, height: TILE_SIZE,
        backgroundColor: '#FFFFFF', borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        borderBottomWidth: 4, borderBottomColor: '#CBD5E1',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2,
        marginLeft: BOARD_PADDING, marginTop: BOARD_PADDING,
    },
    tileEmpty: { backgroundColor: 'transparent', borderBottomWidth: 0, shadowOpacity: 0 },
    tileText: { fontSize: 28, fontWeight: '900', color: '#334155' },
    hintContainer: { marginTop: 40, alignItems: 'center' },
    hintText: { color: '#94A3B8', fontWeight: '700', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
});
