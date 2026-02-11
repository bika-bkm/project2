// 1. استدعاء المكتبات
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");



const app = express();
app.use(express.json()); // عشان السيرفر يفهم JSON
app.use(cors()); // يسمح للـ Front-End يتكلم معاه


const PORT = 5000;

app.use(express.json());

// 🛡️ Content Security Policy
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // أي حاجة افتراضية من نفس السيرفر
            connectSrc: [
                "'self'",               // السيرفر نفسه
                "http://127.0.0.1:8000", // السماح بالـ API من هنا
                "ws://localhost:42877/"  // السماح بالـ WebSocket
            ]
        }
    })
);

// 🟢 serve frontend files
app.use(express.static(path.join(__dirname, "../")));

// 3. مساعدة: دالة تقرأ البيانات من db.json
function readDB() {
    const data = fs.readFileSync("db.json", "utf8");
    return JSON.parse(data);
}

// 4. مساعدة: دالة تكتب بيانات جديدة في db.json
function writeDB(data) {
    fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}

// 5. Route: رجع كل الألعاب
app.get("/games", (req, res) => {
    const db = readDB();
    res.json(db.games);
});

// 6. Route: رجع كل المستخدمين
app.get("/users", (req, res) => {
    const db = readDB();
    res.json(db.users);
});

// 7. Route: تسجيل مستخدم جديد
app.post("/signup", (req, res) => {
    const db = readDB();
    const newUser = {
        id: db.users.length + 1,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    res.json({ message: "User created!", user: newUser });
});

// 8. Route: تسجيل الدخول
app.post("/login", (req, res) => {
    const db = readDB();
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ message: "Login successful", user });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// 9. تشغيل السيرفر
app.listen(5000, () => {
    console.log("✅ Server running on http://localhost:5000");
});
