# Dokie for Node.js

A single Node.js package for serving the Dokie API documentation UI across generic servers, fetch-style runtimes, Express, Fastify, and Hono.

See the main repository at: [https://github.com/mergehez/dokie](https://github.com/mergehez/dokie)

## Installation

```bash
npm install @mergehez/dokie-node
```

## Local development

Run package commands from `packages/node`:

```bash
bun install
bun run build
```

## Usage

### Generic Node.js

```js
import http from 'node:http';
import * as dokie from '@mergehez/dokie-node';

const server = http.createServer((req, res) => {
    if (req.url !== '/dokie') {
        res.statusCode = 404;
        res.end('Not found');
        return;
    }

    const html = dokie.renderDokieHtml(
        {
            openApiJsonUrl: '/openapi.json',
        },
        req
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
});

server.listen(3000);
```

### Custom server

Use `forCustomServer()` when your server is not Express, Fastify, or Hono, but can still provide an app-like `get(path, handler)` API plus request/response objects compatible with the exported `DokieRequestLike` and `DokieResponseLike` types.

```js
import * as dokie from '@mergehez/dokie-node';

const customDokie = dokie.forCustomServer();
```

### Fetch-style runtimes

Use `forFetch()` for frameworks and runtimes built around web `Request` and `Response` objects, such as Next.js route handlers, Nuxt/Nitro server routes, Remix loaders/actions, Astro endpoints, and other fetch-based runtimes.

This is not a dedicated Next.js adapter. The example below works at the route-handler level because Next.js exposes the standard web `Request` and `Response` APIs there.

```js
import * as dokie from '@mergehez/dokie-node';

export const GET = dokie.forFetch().createDokieHandler({
    openApiJsonUrl: '/openapi.json',
});
```

#### Next.js route handler example

Example file: `app/dokie/route.ts`

```ts
import * as dokie from '@mergehez/dokie-node';

export const GET = dokie.forFetch().createDokieHandler({
    openApiJsonUrl: '/openapi.json',
    title: 'Dokie',
});
```

If you need deeper Next.js-specific behavior beyond a standard route handler, Dokie does not currently provide a dedicated Next.js integration layer.

### Express

```js
import express from 'express';
import * as dokie from '@mergehez/dokie-node';

const app = express();

dokie.forExpress().registerDokieRoute(app, {
    routePath: '/dokie',
    title: 'Dokie',
    openApiJsonUrl: '/openapi.json',
    hostnames: ['https://api.example.com'],
    variables: {
        username: 'demo@example.com',
    },
    headers: {
        'x-api-key': '',
    },
    bodies: {
        'POST /api/login': JSON.stringify(
            {
                email: '{{username}}',
                password: 'password',
            },
            null,
            2
        ),
    },
    postscripts: {
        'POST /api/login': "envs.headers['x-api-key'] = response.data.value.token;",
    },
    favorites: ['POST /api/login'],
});

app.listen(3000);
```

### Fastify

```js
import Fastify from 'fastify';
import * as dokie from '@mergehez/dokie-node';

const app = Fastify();

dokie.forFastify().registerDokieRoute(app, {
    openApiJsonUrl: '/openapi.json',
});

await app.listen({ port: 3000 });
```

### Hono

```js
import { Hono } from 'hono';
import * as dokie from '@mergehez/dokie-node';

const app = new Hono();

dokie.forHono().registerDokieRoute(app, {
    openApiJsonUrl: '/openapi.json',
});
```

## Options

- `routePath`: route registered by `registerDokieRoute`. Defaults to `/dokie`.
- `title`: optional page title.
- `currentHostname`: explicit base URL. By default it is inferred from the incoming request.
- `openApiJsonUrl`: OpenAPI JSON URL. Defaults to `/openapi.json`.
- `hostnames`: alternate hostnames shown in the UI. Defaults to `[currentHostname]` when available.
- `variables`: predefined environment variables.
- `headers`: predefined global headers.
- `bodies`: predefined request bodies by endpoint id.
- `postscripts`: predefined post-request scripts by endpoint id.
- `favorites`: predefined favorite endpoint ids.
- `assetPath`: override the path to `dokie.html` if needed.

## Exports

- `renderDokieHtml(options, req)`
- `createDokieHandler(options)`
- `createDokieMiddleware(options)`
- `registerDokieRoute(app, options)`
- `getDokieAssetPath()`
- `forCustomServer()`
- `forExpress()`
- `forFastify()`
- `forFetch()`
- `forHono()`

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
