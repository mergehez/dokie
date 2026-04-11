# Dokie Node Demos

This demo project shows how to use `@mergehez/dokie-node` with Express, Fastify, and Hono from one shared setup.

## Run

```bash
bun install
bun run dev:express
```

Available scripts:

- `bun run dev:express`
- `bun run dev:fastify`
- `bun run dev:hono`

Default ports:

- Express: `http://localhost:3001/dokie`
- Fastify: `http://localhost:3002/dokie`
- Hono: `http://localhost:3003/dokie`

Each demo also exposes `GET /openapi.json` and `GET /hello`.

## Notes

- The demo depends on the local package at `../../packages/node`.
- All three demos share the same sample API shape.
