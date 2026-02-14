// public/js/api.js
// 🔴 هذا الملف وظيفته: التحدث مع السيرفر نيابة عن الصفحات

class API {
    constructor() {
        this.baseURL = 'http://localhost:3000/api'; // عنوان السيرفر
    }

    // ========== طلبات المصادقة ==========

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل تسجيل الدخول');
            }

            // حفظ البيانات في localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return { success: true, data };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signup(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل إنشاء الحساب');
            }

            return { success: true, data };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== طلبات المستخدمين ==========

    async getCurrentUser() {
        const token = localStorage.getItem('token');

        if (!token) {
            return { success: false, error: 'لا يوجد توكن' };
        }

        try {
            const response = await fetch(`${this.baseURL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل جلب بيانات المستخدم');
            }

            return { success: true, data };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllUsers() {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseURL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }

    // ========== طلبات المنتجات (مثال) ==========

    async getProducts() {
        const response = await fetch(`${this.baseURL}/products`);
        return response.json();
    }

    async getProductById(id) {
        const response = await fetch(`${this.baseURL}/products/${id}`);
        return response.json();
    }

    // ========== دوال مساعدة ==========

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// إنشاء نسخة واحدة من API للتطبيق كله
const api = new API();