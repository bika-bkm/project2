// server/server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-هذا-سر-جدا';

app.use(express.json());

// ========== قراءة وكتابة قاعدة البيانات ==========

async function readDB() {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
}

// ========== مسارات المصادقة ==========

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await readDB();

        // البحث عن المستخدم
        const user = db.users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // التحقق من كلمة المرور
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
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

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// إنشاء حساب جديد
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, username, fullName } = req.body;
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

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// ========== Middleware التحقق من التوكن ==========

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

// ========== مسارات محمية ==========

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
        console.error(error);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// جلب كل المستخدمين (للمشرفين فقط)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // التحقق من صلاحية المشرف
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'غير مصرح' });
        }

        const db = await readDB();
        const users = db.users.map(({ password, ...user }) => user);

        res.json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// ========== تشغيل السيرفر ==========

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
    console.log(`📁 API متاحة على http://localhost:${PORT}/api`);
});