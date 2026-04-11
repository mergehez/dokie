import * as dokie from '@mergehez/dokie-node';
import express from 'express';
import { createHelloPayload, createOpenApiDocument } from './shared.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.get('/openapi.json', (_req, res) => {
    res.json(createOpenApiDocument('Express', port));
});

app.get('/hello', (_req, res) => {
    res.json(createHelloPayload('Express'));
});

dokie.forExpress().registerDokieRoute(app, {
    routePath: '/dokie',
    title: 'Dokie Express Demo',
    openApiJsonUrl: '/openapi.json',
});

app.listen(port, () => {
    console.log(`Express demo listening on http://localhost:${port}`);
    console.log(`Dokie UI available at http://localhost:${port}/dokie`);
});