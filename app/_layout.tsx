import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F8FAFC' }, // slate-50
                }}
            >
                <Stack.Screen name="index" />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}
