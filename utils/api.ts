import axios from 'axios';
import Constants from 'expo-constants';

/**
 * API 基础地址配置
 * 
 * 开发模式下：自动获取 Expo 开发服务器的 IP，连接同一台电脑上运行的 Next.js 后端 (port 3000)。
 * 生产模式下：使用 Vercel 线上地址。
 * 
 * ⚠️ 使用前请确保本地 web 后端已启动: cd school-homework && npm run dev
 */
const getBaseUrl = () => {
    if (__DEV__) {
        // Expo 开发服务器会暴露当前设备可访问的 IP (e.g. "10.30.56.27:8081")
        const debuggerHost = Constants.expoConfig?.hostUri;
        const localIP = debuggerHost?.split(':')[0];
        if (localIP) {
            return `http://${localIP}:3000/api`;
        }
    }
    return 'https://zhouyiman.zhouenjun.top/api';
};

const API_BASE_URL = getBaseUrl();

console.log('[API] Base URL:', API_BASE_URL);

export const api = {
    word: {
        transform: (word: string) => axios.post(`${API_BASE_URL}/word`, { word }),
    },
    chinese: {
        idiomChain: (params: { word: string; lastWord: string; grade: string; type: string }) =>
            axios.post(`${API_BASE_URL}/chinese/idiom-chain`, params),
        riddle: (params: { grade: string }) =>
            axios.post(`${API_BASE_URL}/chinese/riddle`, params),
    }
};

export default api;
