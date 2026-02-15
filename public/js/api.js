// public/js/api.js

class API {
    constructor() {
        this.baseURL = 'http://localhost:3000/api'; // تأكد من البورت 3000
    }

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

            // حفظ البيانات
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return { success: true, data };

        } catch (error) {
            console.error('❌ خطأ في login:', error);
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
            console.error('❌ خطأ في signup:', error);
            return { success: false, error: error.message };
        }
    }

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
            console.error('❌ خطأ في getCurrentUser:', error);
            return { success: false, error: error.message };
        }
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// ✅ مهم جداً: إنشاء نسخة وتصديرها
const api = new API();

// للاستخدام في الملفات الأخرى
window.api = api; // متاح في كل الصفحات