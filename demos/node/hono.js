import { serve } from '@hono/node-server';
import * as dokie from '@mergehez/dokie-node';
import { Hono } from 'hono';
import { createHelloPayload, createOpenApiDocument } from './shared.js';

const app = new Hono();
const port = Number(process.env.PORT ?? 3003);

app.get('/openapi.json', (context) => context.json(createOpenApiDocument('Hono', port)));

app.get('/hello', (context) => context.json(createHelloPayload('Hono')));

dokie.forHono().registerDokieRoute(app, {
    routePath: '/dokie',
    title: 'Dokie Hono Demo',
    openApiJsonUrl: '/openapi.json',
});

serve({
    fetch: app.fetch,
    port,
});

console.log(`Hono demo listening on http://localhost:${port}`);
console.log(`Dokie UI available at http://localhost:${port}/dokie`);