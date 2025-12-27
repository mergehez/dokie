<?php

use Illuminate\Support\Facades\Route;

// Serve the Vue SPA for all frontend routes except API and static files
Route::get('/', static fn() => view('app'));
Route::get('/documentation', static fn() => view('app'));

// No need to do anything special here.
// Dokie route is registered automatically when the package is installed