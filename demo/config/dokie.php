<?php

return [
    /**
     * The default basepath to be used by Dokie.
     * If you don't set 'DOKIE_UI_BASEPATH' in your .env file, it defaults to null.
     * And if it's null, the base URL of the application will be used.
     */
    'current_basepath' => env('DOKIE_UI_BASEPATH'),

    /**
     * The URL to the OpenAPI JSON specification.
     * You can set 'DOKIE_UI_OPEN_API_JSON_URL' in your .env file to customize this URL.
     * By default, it points to '/docs/api.json'.
     */
    'open_api_json_url' => env('DOKIE_UI_OPEN_API_JSON_URL', '/docs/api.json'),

    /**
     * An array of basepaths that you can switch between on Dokie-UI.
     * You can set 'DOKIE_UI_BASEPATHS' in your .env file as a comma-separated list.
     * I the value is 'null', 'current_basepath' will be used.
     */
    'basepaths' => env('DOKIE_UI_BASEPATHS') ? explode(',', env('DOKIE_UI_BASEPATHS')) : null,

    /**
     * Predefined environment variables to be used in request bodies and headers.
     */
    'variables' => [
        'email' => 'dokie@dokie.com',
        'password' => 'mysecretpassword',
    ],

    /**
     * Predefined global headers to be used in every request.
     */
    'headers' => [
        'x-api-key' => '',
        'Accept' => 'application/json',
    ],

    /**
     * Predefined request bodies for specific endpoints.
     */
    'bodies' => [
        'POST /login' => json_encode([
            'email' => '{{email}}',
            'password' => '{{password}}',
        ], JSON_PRETTY_PRINT),
    ],

    /**
     * Post-scripts to be executed after specific requests.
     */
    'postscripts' => [
        'POST /login' => "envs.headers['x-api-key'] = response.data.value.api_key;",
        'POST /logout' => "envs.headers['x-api-key'] = '';", // Clear the API key on logout
    ],

    /**
     * A list of predefined favorite endpoints for quick access.
     */
    'favorites' => [
        'POST /login',
        'POST /logout',
    ]
];

