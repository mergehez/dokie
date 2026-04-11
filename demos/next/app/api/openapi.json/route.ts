export async function GET() {
    return Response.json({
        openapi: '3.1.0',
        info: {
            title: 'Dokie Next Demo API',
            version: '1.0.0',
            description: 'A minimal Next.js route-handler demo for the Dokie Node package.',
        },
        servers: [
            {
                url: 'http://localhost:3011',
            },
        ],
        paths: {
            '/api/hello': {
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
    });
}
