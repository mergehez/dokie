export function createHelloPayload(target) {
    return {
        message: `Hello from the Dokie ${target} demo.`,
    };
}

export function createOpenApiDocument(target, port) {
    return {
        openapi: '3.1.0',
        info: {
            title: `Dokie ${target} Demo API`,
            version: '1.0.0',
            description: `A small ${target} demo for the Dokie Node package.`,
        },
        servers: [
            {
                url: `http://localhost:${port}`,
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
}