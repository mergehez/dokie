# Dokie Next Demo

This is a minimal Next.js demo that uses `@mergehez/dokie-node` at the route-handler level.

It is not a dedicated Next.js integration. It works because Next.js route handlers expose the standard web `Request` and `Response` APIs.

## Run

```bash
bun install
bun run dev
```

Open `http://localhost:3011/dokie` for Dokie.

## Routes

- `/dokie`
- `/api/openapi.json`
- `/api/hello`
