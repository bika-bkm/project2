// server/server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-123456789';

// ✅ مهم جداً: السماح بالطلبات من المتصفح
app.use(cors({
    origin: '*', // في الإنتاج حدد domains محددة
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ التأكد من وجود ملف db.json
async function initDB() {
    try {
        await fs.access(path.join(__dirname, 'db.json'));
    } catch {
        // إنشاء ملف db.json إذا لم يكن موجوداً
        const initialData = {
            users: [
                {
                    id: 1,
                    email: 'admin@example.com',
                    username: 'admin',
                    fullName: 'مدير النظام',
                    password: await bcrypt.hash('admin123', 10),
                    role: 'admin',
                    createdAt: new Date().toISOString()
                }
            ],
            products: [],
            settings: {}
        };
        await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(initialData, null, 2));
        console.log('✅ تم إنشاء ملف db.json');
    }
}

// قراءة قاعدة البيانات
async function readDB() {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
}

// ✅ مسار اختبار للتأكد من أن السيرفر شغال
app.get('/api/test', (req, res) => {
    res.json({ message: 'السيرفر شغال ✅', time: new Date() });
});

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('📨 محاولة تسجيل دخول:', req.body.email);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
        }

        const db = await readDB();

        // البحث عن المستخدم
        const user = db.users.find(u => u.email === email);

        if (!user) {
            console.log('❌ مستخدم غير موجود:', email);
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // التحقق من كلمة المرور
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('❌ كلمة مرور خاطئة لـ:', email);
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // إنشاء توكن
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        // إرسال البيانات (بدون كلمة المرور)
        const { password: _, ...userWithoutPassword } = user;

        console.log('✅ تسجيل دخول ناجح:', email);

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('❌ خطأ في login:', error);
        res.status(500).json({ message: 'خطأ في السيرفر: ' + error.message });
    }
});

// إنشاء حساب جديد
app.post('/api/auth/signup', async (req, res) => {
    try {
        console.log('📨 محاولة إنشاء حساب:', req.body.email);

        const { email, password, username, fullName } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: 'جميع الحقول المطلوبة يجب ملؤها' });
        }

        const db = await readDB();

        // التحقق من عدم تكرار البريد
        if (db.users.some(u => u.email === email)) {
            return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء مستخدم جديد
        const newUser = {
            id: db.users.length + 1,
            email,
            username,
            fullName: fullName || username,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        // حفظ في قاعدة البيانات
        db.users.push(newUser);
        await writeDB(db);

        // إرسال الرد (بدون كلمة المرور)
        const { password: _, ...userWithoutPassword } = newUser;

        console.log('✅ تم إنشاء حساب جديد:', email);

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('❌ خطأ في signup:', error);
        res.status(500).json({ message: 'خطأ في السيرفر: ' + error.message });
    }
});

// Middleware التحقق من التوكن
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'مطلوب تسجيل الدخول' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'التوكن غير صالح' });
        }
        req.user = user;
        next();
    });
}

// جلب بيانات المستخدم الحالي
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const db = await readDB();
        const user = db.users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// بدء التشغيل
async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
        console.log(`📁 اختبر الاتصال: http://localhost:${PORT}/api/test`);
    });
}

start();