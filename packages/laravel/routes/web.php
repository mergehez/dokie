<?php

use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

Route::get('/dokie', function () {
    $dokiePath = __DIR__.'/../resources/assets/dokie.html';
    if (!file_exists($dokiePath)) {
        abort(404, 'Dokie UI not found.');
    }
    $html = file_get_contents($dokiePath);

    $config = config('dokie');

    $currentHostname = $config['current_basepath'] ?? url('/');
    $currentHostname = \Illuminate\Support\Str::rtrim($currentHostname, '/');
    $hostnames = $config['basepaths'] ?? [];
    if (count($hostnames) == 0) {
        $hostnames = [$currentHostname];
    }

    $windowDokie = json_encode([
        'currentHostname' => $currentHostname,
        'openApiJsonUrl' => $config['open_api_json_url'] ?? '/docs/api.json',
        'hostnames' => $hostnames,
        'variables' => $config['variables'] ?? [],
        'headers' => $config['headers'] ?? [],
        'bodies' => $config['bodies'] ?? [],
        'postscripts' => $config['postscripts'] ?? [],
        'favorites' => $config['favorites'] ?? [],
    ]);

    $finalHtml = str_replace(
        '<script>/*inject-area*/</script>',
        "<script>
            window.dokie = $windowDokie;
            console.log(window.dokie);
        </script>",
        $html
    );
    return Response::make($finalHtml, 200, ['Content-Type' => 'text/html']);
});
