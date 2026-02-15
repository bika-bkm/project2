// اختبر إذا كان api موجود
console.log(window.api);

// اختبر الاتصال بالسيرفر
fetch('http://localhost:3000/api/test')
    .then(res => res.json())
    .then(data => console.log('✅ السيرفر شغال:', data))
    .catch(err => console.error('❌ السيرفر مش شغال:', err));