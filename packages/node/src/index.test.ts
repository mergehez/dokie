import { describe, expect, test } from 'bun:test';

import * as dokie from './index';

describe('dokie node handlers', () => {
    test('forCustomServer createDokieHandler writes html and content type', () => {
        const headers = new Map<string, string>();
        let body = '';

        const handler = dokie.forCustomServer().createDokieHandler({
            openApiJsonUrl: '/openapi.json',
            title: 'Dokie Test',
        });

        handler(
            {
                headers: {
                    host: 'api.example.com',
                },
                protocol: 'https',
            },
            {
                setHeader(name, value) {
                    headers.set(name.toLowerCase(), value);
                },
                end(chunk) {
                    body = String(chunk ?? '');
                },
            }
        );

        expect(headers.get('content-type')).toBe('text/html; charset=utf-8');
        expect(body).toContain('window.dokie =');
        expect(body).toContain('https://api.example.com/openapi.json');
        expect(body).toContain('<title>Dokie Test</title>');
    });

    test('forFetch createDokieHandler returns html response', async () => {
        const handler = dokie.forFetch().createDokieHandler({
            openApiJsonUrl: '/openapi.json',
            title: 'Fetch Dokie',
        });

        const response = handler(new Request('https://app.example.com/dokie'));
        const body = await response.text();

        expect(response).toBeInstanceOf(Response);
        expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
        expect(body).toContain('window.dokie =');
        expect(body).toContain('https://app.example.com/openapi.json');
        expect(body).toContain('<title>Fetch Dokie</title>');
    });
});
