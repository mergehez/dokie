<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the API key is present in the request headers
        $apiKey = $request->header('x-api-key', 'notset');
        if ($apiKey === 'notset' || !$apiKey) {
            return response([
                'message' => 'The header x-api-key is required',
                'value' => null,
            ], 401);
        }

        $user = User::where('api_key', $apiKey)->first();
        if (!$user) {
            return response([
                'message' => 'Invalid API key',
                'value' => null,
            ], 401);
        }

        // Check if the API key is expired
        if ($user->api_key_expires_at && $user->api_key_expires_at < now()) {
            return response([
                'message' => 'API key has expired',
                'value' => null,
            ], 401);
        }

        $user->api_key_expires_at = now()->addMinutes(60);
        $user->save();

        auth()->login($user);

        return $next($request);
    }
}
