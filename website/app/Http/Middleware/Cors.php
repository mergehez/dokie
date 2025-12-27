<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Log::info('CORS Middleware applied');
        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Headers: *');
        // header('Access-Control-Allow-Methods: *');

        $response = $next($request);

        // if ($response->headers->has('Access-Control-Allow-Origin')) {
        //     Log::info('CORS headers already set in response');
        //     return $response;
        // }
        // $response->header('Access-Control-Allow-Origin', '*');
        // $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        // $response->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');

        return $response;
    }
}