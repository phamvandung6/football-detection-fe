'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios'; // Hoặc dùng fetch
import { User } from '@/types/user'; // Đã import đúng

interface SessionData {
    isAuthenticated: boolean;
    user: User | null;
}

// Hàm fetch session data
const fetchSession = async (): Promise<SessionData> => {
    try {
        const { data } = await axios.get<SessionData>('/api/auth/session');
        return data;
    } catch (error) {
        // Nếu API route bị lỗi, coi như chưa đăng nhập
        console.error('Error fetching session:', error);
        return { isAuthenticated: false, user: null };
    }
};

export function useAuthSession() {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching, // Có thể dùng để hiển thị loading khi refetching
    } = useQuery<SessionData>({ 
        queryKey: ['authSession'], // Key cho query này
        queryFn: fetchSession,
        staleTime: 5 * 60 * 1000, // Dữ liệu được coi là cũ sau 5 phút
        refetchOnWindowFocus: true, // Tự động fetch lại khi focus window
        retry: 1, // Thử lại 1 lần nếu lỗi
    });

    return {
        session: data ?? { isAuthenticated: false, user: null }, // Luôn trả về object, kể cả khi đang load
        user: data?.user ?? null,
        isAuthenticated: data?.isAuthenticated ?? false,
        isLoading: isLoading,
        isError: isError,
        error: error,
        refetchSession: refetch, // Hàm để trigger refetch thủ công
        isFetchingSession: isFetching,
    };
} 