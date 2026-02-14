// public/js/login.js
import { api } from './api.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    try {
        // تعطيل الزر
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ جاري تسجيل الدخول...';

        // محاولة تسجيل الدخول
        const result = await api.login(email, password);

        if (result.success) {
            // نجاح
            showMessage('✅ تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');
            setTimeout(() => {
                window.location.href = '/public/index.html';
            }, 1500);
        } else {
            // فشل
            showMessage(`❌ ${result.error}`, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'تسجيل الدخول';
        }

    } catch (error) {
        showMessage('❌ حدث خطأ غير متوقع', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'تسجيل الدخول';
    }
});

function showMessage(text, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = text;
    msgDiv.className = `message ${type}`;
}