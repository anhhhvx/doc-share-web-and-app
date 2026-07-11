import { API_BASE_URL } from '../config';

// Helper to fetch with a timeout so it doesn't hang indefinitely on network failures
async function fetchWithTimeout(resource, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const headers = {
        ...(options.headers || {}),
        'Bypass-Tunnel-Reminder': 'true'
    };

    try {
        const response = await fetch(resource, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Kết nối tới server bị quá hạn (Timeout). Vui lòng kiểm tra địa chỉ IP.');
        }
        throw error;
    }
}

export async function fetchCategories() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
        throw new Error('Lỗi tải danh mục.');
    }
    return response.json();
}

export async function fetchDocuments(q = '', category = '') {
    let url = `${API_BASE_URL}/api/documents?`;
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;

    const response = await fetchWithTimeout(url);
    if (!response.ok) {
        throw new Error('Lỗi tải danh sách tài liệu.');
    }
    return response.json();
}

export async function fetchDocumentById(id) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/documents/${id}`);
    if (!response.ok) {
        throw new Error('Lỗi tải chi tiết tài liệu.');
    }
    return response.json();
}

export async function addComment(id, name, email, content, rating, userId = '') {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/documents/${id}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, content, rating, userId })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi gửi bình luận.');
    }
    return response.json();
}

export async function login(username, password) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi đăng nhập.');
    }
    return response.json();
}

export async function register(fullName, email, phone, username, password) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, phone, username, password })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi đăng ký tài khoản.');
    }
    return response.json();
}

export async function submitContact(name, email, message) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi gửi ý kiến liên hệ.');
    }
    return response.json();
}

export async function fetchSiteData() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/site-data`);
    if (!response.ok) {
        throw new Error('Lỗi tải thông tin giới thiệu.');
    }
    return response.json();
}
