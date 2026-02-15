// public/js/login.js

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ صفحة تسجيل الدخول تحمّلت');

    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (!loginForm) {
        console.error('❌ نموذج تسجيل الدخول غير موجود!');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        console.log('📨 محاولة تسجيل دخول:', email);

        // عرض رسالة تحميل
        messageDiv.textContent = '⏳ جاري تسجيل الدخول...';
        messageDiv.className = 'message';
        messageDiv.style.display = 'block';

        // تعطيل الزر
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ جاري...';

        try {
            // ✅ استخدام api المتاح من api.js
            const result = await api.login(email, password);

            console.log('📬 نتيجة تسجيل الدخول:', result);

            if (result.success) {
                // نجاح
                messageDiv.textContent = '✅ تم تسجيل الدخول بنجاح! جاري التحويل...';
                messageDiv.className = 'message success';

                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                // فشل
                messageDiv.textContent = `❌ ${result.error}`;
                messageDiv.className = 'message error';

                // إعادة الزر
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }

        } catch (error) {
            console.error('❌ خطأ غير متوقع:', error);
            messageDiv.textContent = '❌ حدث خطأ غير متوقع';
            messageDiv.className = 'message error';

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});