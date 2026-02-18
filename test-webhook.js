const https = require('http');

const data = JSON.stringify({
    sessao: 'test-session',
    user: {
        name: 'test-user',
        role: 'vendedor'
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/messages/select',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
        body += d;
    });
    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
