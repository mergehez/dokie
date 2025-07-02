<?php

use Illuminate\Support\Facades\Route;

Route::get('/dokie', function () {
    $html = file_get_contents(public_path('dokie.html'));
    $currentHostname = \Illuminate\Support\Str::rtrim(url()->current(), '/dokie');
    $finalHtml = str_replace(
        '<script>/*inject-area*/</script>',
        "<script>
            window.dokie = {
                currentHostname: '$currentHostname',
                openApiJsonUrl: '$currentHostname/docs/api.json',
                hostnames: [
                    '$currentHostname'
                ],
                variables: {
                    email: 'demo@dokie.com',
                    password: 'password'
                },
                headers: {
                    'x-api-key': '',
                    'Accept': 'application/json'
                },
                bodies: {
                    'POST /api/login': JSON.stringify({
                        email: '{{email}}',
                        password: '{{password}}'
                    }, null, 2),
                },
                postscripts: {
                    'POST /api/login': \"envs.headers['x-api-key'] = response.data.value.api_key;\",
                    'POST /api/logout': \"envs.headers['x-api-key'] = '';\" // Clear the API key on logout
                },
                favorites: [
                    'POST /api/login',
                    'POST /api/logout',
                ]
            };
        </script>",
        $html
    );

    return response($finalHtml)
        ->header('Content-Type', 'text/html')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
});