import { API_URL } from '@/lib/utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Định nghĩa lại kiểu User nếu cần, hoặc import từ nơi khác
interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    enabled: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

interface SessionData {
    isAuthenticated: boolean;
    user: User | null;
}

// Hàm để lấy thông tin user từ backend (ví dụ: /users/me)
async function fetchCurrentUserFromAPI(token: string): Promise<User | null> {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            // Quan trọng: Thêm cache: 'no-store' để đảm bảo dữ liệu luôn mới
            cache: 'no-store',
        });
        if (!response.ok) {
            // Có thể log lỗi chi tiết hơn ở đây
            console.error(`API Error (${response.status}): Failed to fetch user`);
            return null;
        }
        const data = await response.json();
        // Giả sử API trả về user object trong data.data hoặc trực tiếp
        return data.success ? data.data : data;
    } catch (error) {
        console.error("Fetch current user error:", error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json<SessionData>({ isAuthenticated: false, user: null });
    }

    // Xác thực token bằng cách gọi API backend
    const user = await fetchCurrentUserFromAPI(token);

    if (!user) {
        // Nếu fetch user thất bại (token hết hạn, không hợp lệ, lỗi API), coi như chưa đăng nhập
        // Xóa cookie cũ để tránh lỗi lặp lại
        // Lưu ý: NextResponse không có cookieStore.delete trực tiếp
        // Cần tạo response mới để set cookie hết hạn
        const response = NextResponse.json<SessionData>({ isAuthenticated: false, user: null });
        response.cookies.set('auth_token', '', { maxAge: -1, path: '/' });
        response.cookies.set('refresh_token', '', { maxAge: -1, path: '/' });
        return response;
    }

    return NextResponse.json<SessionData>({ isAuthenticated: true, user });
} 