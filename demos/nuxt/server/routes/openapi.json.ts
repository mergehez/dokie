import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
    return {
        openapi: '3.1.0',
        info: {
            title: 'Dokie Nuxt Demo API',
            version: '1.0.0',
            description: 'A minimal Nuxt/Nitro route demo for the Dokie Node package.',
        },
        servers: [
            {
                url: 'http://localhost:3012',
            },
        ],
        paths: {
            '/hello': {
                get: {
                    operationId: 'getHello',
                    summary: 'Return a demo greeting',
                    responses: {
                        '200': {
                            description: 'Greeting payload',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                            },
                                        },
                                        required: ['message'],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
});
