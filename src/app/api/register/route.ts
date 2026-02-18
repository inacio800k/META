import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('API /api/register received body:', body);

        // Forward request to n8n webhook
        const n8nUrl = 'https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/registra_usuario';
        console.log('Forwarding to n8n URL:', n8nUrl);

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('n8n response status:', n8nResponse.status);

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            console.error('n8n error response:', errorText);
            throw new Error(`n8n responded with status: ${n8nResponse.status} - ${errorText}`);
        }

        const data = await n8nResponse.text();
        console.log('n8n success response:', data);

        // Try to parse JSON if possible, otherwise return text
        try {
            return NextResponse.json(JSON.parse(data));
        } catch {
            return NextResponse.json({ message: data });
        }

    } catch (error: any) {
        console.error('Registration Proxy Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process registration',
                details: error ? error.toString() : 'Unknown error',
                stack: error?.stack,
                message: error?.message
            },
            { status: 500 }
        );
    }
}
