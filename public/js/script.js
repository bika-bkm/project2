// public/js/script.js
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {

    // التحقق من تسجيل الدخول
    if (!api.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // جلب بيانات المستخدم الحالي
    const result = await api.getCurrentUser();

    if (result.success) {
        // عرض اسم المستخدم
        const welcomeMsg = document.getElementById('welcomeMsg');
        if (welcomeMsg) {
            welcomeMsg.textContent = `👋 مرحباً ${result.data.fullName || result.data.email}`;
        }

        console.log('✅ المستخدم الحالي:', result.data);
    } else {
        // التوكن غير صالح
        api.logout();
    }

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            api.logout();
        });
    }
});