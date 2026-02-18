const https = require('https');

const url = 'https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/pega_usuario';

const options = {
    method: 'POST', // Assuming POST based on previous requests, though GET is also possible. Sticking to pattern.
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log('Status Code:', res.statusCode);
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw Data:', data);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
