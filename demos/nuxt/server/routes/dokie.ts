import * as dokie from '@mergehez/dokie-node';
import { defineEventHandler, getRequestHeaders, getRequestURL } from 'h3';

const handler = dokie.forFetch().createDokieHandler({
    title: 'Dokie Nuxt Demo',
    openApiJsonUrl: '/openapi.json',
});

export default defineEventHandler((event) => {
    const request = new Request(getRequestURL(event).toString(), {
        method: event.method,
        headers: new Headers(getRequestHeaders(event)),
    });

    return handler(request);
});
