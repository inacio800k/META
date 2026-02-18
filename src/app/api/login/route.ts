import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('API /api/login received login request for:', body.email);

        const n8nUrl = 'https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/loga_usuario';

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('n8n login response status:', n8nResponse.status);

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            console.error('n8n login error response:', errorText);
            return NextResponse.json(
                { message: 'Falha no login', details: errorText },
                { status: n8nResponse.status }
            );
        }

        const data = await n8nResponse.text();

        // Try to parse JSON if possible, otherwise return text
        try {
            return NextResponse.json(JSON.parse(data));
        } catch {
            // If n8n returns just "OK" or similar text but status 200, we treat as success
            // We might need to construct a user object if n8n doesn't return one.
            // For now, let's assume if it's 200, it's valid, but we might need to Mock a user 
            // or expect n8n to return user details.
            // Based on instructions "só deve logar se receber uma resposta código 200".
            return NextResponse.json({ message: data });
        }

    } catch (error: any) {
        console.error('Login Proxy Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process login',
                details: error ? error.toString() : 'Unknown error',
                message: error?.message
            },
            { status: 500 }
        );
    }
}
