<?php

return [
    /**
     * The current hostname to be used by Dokie.
     * If you don't set 'DOKIE_UI_HOSTNAME' in your .env file, it defaults to null.
     * And if it is null, the base URL of the application will be used: url('/')
     */
    'current_hostname' => env('DOKIE_UI_HOSTNAME'),

    /**
     * The URL to the OpenAPI JSON specification.
     * You can set 'DOKIE_UI_OPEN_API_JSON_URL' in your .env file to customize this URL.
     * Our recommended package for OpenAPI generation, Dedoc\Scramble, exposes it at '/docs/api.json'.
     */
    'open_api_json_url' => env('DOKIE_UI_OPEN_API_JSON_URL', '/docs/api.json'),

    /**
     * An array of hostnames that you can switch between on Dokie-UI.
     * You can set 'DOKIE_UI_HOSTNAMES' in your .env file as a comma-separated list.
     * I the value is 'null', 'current_hostname' will be used.
     */
    'hostnames' => env('DOKIE_UI_HOSTNAMES') ? explode(',', env('DOKIE_UI_HOSTNAMES')) : null,

    /**
     * Predefined environment variables to be used in request bodies and headers.
     */
    'variables' => [
        // 'email' => 'dokie@dokie.com',
        // 'password' => 'mysecretpassword',
    ],

    /**
     * Predefined global headers to be used in every request.
     */
    'headers' => [
        // 'x-api-key' => '',
        // 'Accept' => 'application/json',
    ],

    /**
     * Predefined request bodies for specific endpoints.
     */
    'bodies' => [
        // 'POST /api/login' => json_encode([
        //     'email' => '{{email}}',
        //     'password' => 'password',
        // ], JSON_PRETTY_PRINT),
    ],

    /**
     * Post-scripts to be executed after specific requests.
     */
    'postscripts' => [
        // 'POST /api/login' => "envs.headers['x-api-key'] = response.data.value.api_key;",
        // 'POST /api/logout' => "envs.headers['x-api-key'] = '';", // Clear the API key on logout
    ],

    /**
     * A list of predefined favorite endpoints for quick access.
     */
    'favorites' => [
        // 'POST /api/login',
        // 'POST /api/logout',
    ]
];

