import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Forward the entire body as it's now structured correctly in the frontend
        const response = await fetch('https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/vendedor_manda_mensagem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Webhook responded with status: ${response.status}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error proxying message:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
