<?php

namespace Dokie;

use Illuminate\Support\ServiceProvider;

class DokieServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'dokie');
        $this->publishes([
            __DIR__.'/../resources/assets' => public_path('vendor/dokie'),
        ], 'dokie-assets');
        $this->publishes([
            __DIR__.'/../config/dokie.php' => config_path('dokie.php'),
        ], 'dokie-config');
    }

    public function register()
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/dokie.php', 'dokie'
        );
    }
}