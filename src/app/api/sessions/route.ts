import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const n8nUrl = 'https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/pega_sessao';

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Sending empty body as it's a GET-like POST
        });

        if (!n8nResponse.ok) {
            throw new Error(`n8n responded with status: ${n8nResponse.status}`);
        }

        const data = await n8nResponse.json();


        // The webhook might return { value: [...] } OR just [...]
        if (Array.isArray(data)) {
            return NextResponse.json(data);
        }

        return NextResponse.json(data.value || []);

    } catch (error: any) {
        console.error('Sessions Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}
