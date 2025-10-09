/* ===================================
   PGT API PROXY SERVER
   Runs on localhost:3003
   Forwards requests to PGT API to bypass CORS
   =================================== */

const http = require('http');
const https = require('https');

const PGT_API_BASE = 'https://www.pgtools.tech/api';
const PGT_API_KEY = 'pgt-partner-omega-terminal-2-25';
const PORT = 3003;

console.log('🚀 Starting PGT Proxy Server...');
console.log(`📍 Proxy will run on: http://localhost:${PORT}`);
console.log(`🎯 Forwarding to: ${PGT_API_BASE}`);

const server = http.createServer((req, res) => {
    // Enable CORS for all origins (development only)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    console.log(`\n📥 ${req.method} ${req.url}`);
    
    // Parse request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        // Forward request to PGT API
        const targetUrl = `${PGT_API_BASE}${req.url}`;
        console.log(`📤 Forwarding to: ${targetUrl}`);
        
        const options = {
            method: req.method,
            headers: {
                'X-API-Key': PGT_API_KEY,
                'Content-Type': 'application/json',
                'User-Agent': 'Omega-Terminal-Proxy/1.0'
            }
        };
        
        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
            console.log(`📦 Request Body: ${body}`);
        }
        
        const proxyReq = https.request(targetUrl, options, (proxyRes) => {
            console.log(`📥 PGT API Response: ${proxyRes.statusCode}`);
            
            // Forward response headers
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            
            // Forward response body
            let responseBody = '';
            proxyRes.on('data', chunk => {
                responseBody += chunk;
            });
            
            proxyRes.on('end', () => {
                console.log(`✅ Response: ${responseBody.substring(0, 200)}...`);
                res.end(responseBody);
            });
        });
        
        proxyReq.on('error', (error) => {
            console.error('❌ Proxy Error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: `Proxy Error: ${error.message}`
            }));
        });
        
        // Send request body if present
        if (body) {
            proxyReq.write(body);
        }
        
        proxyReq.end();
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('✅ ========================================');
    console.log('✅ PGT PROXY SERVER RUNNING!');
    console.log('✅ ========================================');
    console.log('');
    console.log(`🌐 Proxy URL: http://localhost:${PORT}`);
    console.log(`🎯 Target API: ${PGT_API_BASE}`);
    console.log(`🔑 API Key: ${PGT_API_KEY}`);
    console.log('');
    console.log('📋 AVAILABLE ENDPOINTS:');
    console.log('  GET  http://localhost:3003/health');
    console.log('  GET  http://localhost:3003/portfolio');
    console.log('  POST http://localhost:3003/wallet');
    console.log('  DELETE http://localhost:3003/wallet');
    console.log('');
    console.log('🧪 TEST COMMAND:');
    console.log(`  curl http://localhost:${PORT}/health`);
    console.log('');
    console.log('✨ Ready to proxy PGT API requests!');
    console.log('');
    console.log('Press Ctrl+C to stop');
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Either stop the other process or change PORT in this file');
    } else {
        console.error('❌ Server Error:', error);
    }
    process.exit(1);
});

