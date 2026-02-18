import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = await fetch('https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/contas_vendedor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Webhook responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching venedores:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
