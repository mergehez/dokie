# Dokie Nuxt Demo

This is a minimal Nuxt demo that uses `@mergehez/dokie-node` from a Nitro server route.

It is not a dedicated Nuxt adapter. It works at the server-route level by converting the incoming Nitro event into a standard web `Request` and returning a web `Response`.

## Run

```bash
bun install
bun run dev
```

Open `http://localhost:3012/dokie` for Dokie.

## Routes

- `/dokie`
- `/openapi.json`
- `/hello`
