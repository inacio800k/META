import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const n8nUrl = 'https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/aba_mensagem_vendedor';

        const body = await request.json();

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            throw new Error(`n8n responded with status: ${n8nResponse.status} - ${errorText}`);
        }

        const data = await n8nResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Init Messages Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to init messages', details: error.message },
            { status: 500 }
        );
    }
}
