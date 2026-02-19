import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch('https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/vendedor_busca_cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const responseText = await response.text();

        if (!response.ok) {
            const errorMessage = responseText || `Webhook responded with status: ${response.status}`;
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        try {
            const data = JSON.parse(responseText);
            return NextResponse.json(data);
        } catch {
            return NextResponse.json({ result: responseText });
        }
    } catch (error: any) {
        console.error('Error searching clients:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
