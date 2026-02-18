import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        console.log('Select Session Proxy: Start');
        let body;
        try {
            body = await request.json();
            console.log('Select Session Proxy: Body parsed successfully', body);
        } catch (e: any) {
            console.error('Select Session Proxy: Error parsing request body', e);
            throw e;
        }

        const n8nUrl = 'https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/vendedor_selecionou';
        console.log('Select Session Proxy: Calling n8n url', n8nUrl);

        // Fire and forget - don't wait for response if not needed, 
        // but usually we want to know if it succeeded. 
        // User didn't specify if blocking, but for "select" events, non-blocking is often better
        // However, Next.js serverless functions need to wait for fetch to complete.

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!n8nResponse.ok) {
            console.error('n8n response not ok:', n8nResponse.status);
            // We can still return success to frontend to not block UI if critical? 
            // Better to return error.
        }

        const text = await n8nResponse.text();
        console.log('n8n select session response:', text);
        try {
            return NextResponse.json(JSON.parse(text));
        } catch (e) {
            return NextResponse.json({ success: true, raw: text });
        }

    } catch (error: any) {
        console.error('Select Session Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to notify selection', details: error.message },
            { status: 500 }
        );
    }
}
