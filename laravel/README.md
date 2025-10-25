# Dokie UI for Laravel

A Laravel package to serve the Dokie API documentation UI.

See the demo at: [https://dokie.mergesoft.dev/dokie](https://dokie.mergesoft.dev/dokie).

## Installation

1. (If you haven't already) Install an OpenAPI documentation generator package, such as [dedoc/scramble](https://github.com/dedoc/scramble)
2. Require Dokie via Composer:
   ```bash
   composer require mergehez/dokie
   ```
3. (Optional) Publish config:
   ```bash
   php artisan vendor:publish --tag=dokie-config
   ```
4. Visit `/dokie` in your browser.

## License

This package is open-sourced software licensed under the [MIT license](./LICENSE).

