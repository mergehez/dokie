import * as dokie from '@mergehez/dokie-node';
import Fastify from 'fastify';
import { createHelloPayload, createOpenApiDocument } from './shared.js';

const app = Fastify();
const port = Number(process.env.PORT ?? 3002);

app.get('/openapi.json', async () => createOpenApiDocument('Fastify', port));

app.get('/hello', async () => createHelloPayload('Fastify'));

dokie.forFastify().registerDokieRoute(app, {
    routePath: '/dokie',
    title: 'Dokie Fastify Demo',
    openApiJsonUrl: '/openapi.json',
});

await app.listen({ port });

console.log(`Fastify demo listening on http://localhost:${port}`);
console.log(`Dokie UI available at http://localhost:${port}/dokie`);