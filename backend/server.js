// server-raw.js
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;
const HOST = 'localhost';

// إنشاء السيرفر
const server = http.createServer(async (req, res) => {
    // req: يمثل الطلب الوارد
    // res: يمثل الاستجابة الصادرة

    const { method, url, headers } = req;
    const startTime = Date.now();

    console.log(`[${new Date().toISOString()}] ${method} ${url} - بدأ`);

    try {
        // معالجة المسار الرئيسي
        if (url === '/' && method === 'GET') {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Powered-By': 'Node.js Server'
            });
            res.end(`
                <!DOCTYPE html>
                <html>
                    <head><title>سيرفري الخاص</title></head>
                    <body>
                        <h1>مرحباً بالعالم من سيرفر Node.js!</h1>
                        <p>الوقت الحالي: ${new Date()}</p>
                    </body>
                </html>
            `);
        }

        // API JSON
        else if (url === '/api' && method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'مرحباً من API',
                status: 'success',
                timestamp: new Date()
            }));
        }

        // إرسال البيانات (POST)
        else if (url === '/api/data' && method === 'POST') {
            let body = '';

            // تجميع البيانات القادمة على شكل أجزاء
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const parsedBody = JSON.parse(body);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        received: parsedBody,
                        message: 'تم استلام البيانات بنجاح'
                    }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        }

        // معالجة الملفات الثابتة
        else if (url.startsWith('/static/')) {
            const filePath = path.join(__dirname, 'public', url.slice(8));
            try {
                const data = await fs.readFile(filePath);
                const ext = path.extname(filePath);
                const mimeTypes = {
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'text/javascript',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.json': 'application/json'
                };

                res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
                res.end(data);
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            }
        }

        // المسارات غير الموجودة
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - الصفحة غير موجودة');
        }

        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);

    } catch (error) {
        console.error('خطأ في السيرفر:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - خطأ داخلي في السيرفر');
    }
});

// بدء الاستماع على المنفذ
server.listen(PORT, HOST, () => {
    console.log(`🚀 السيرفر يعمل على http://${HOST}:${PORT}`);
    console.log(`📡 الضغط على Ctrl+C لإيقاف السيرفر`);
});

// معالجة إيقاف السيرفر بشكل نظيف
process.on('SIGINT', () => {
    console.log('\n🛑 جاري إيقاف السيرفر...');
    server.close(() => {
        console.log('✅ تم إيقاف السيرفر بنجاح');
        process.exit(0);
    });
});