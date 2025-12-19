# Dokie Demo Project

This is a demo project for the Dokie API documentation UI package.

You can visit the live demo at [https://dokie.mergesoft.dev/dokie](https://dokie.mergesoft.dev/dokie).

The project is built with Laravel. If you want to replicate this demo in your laravel project, follow these steps:

1. (If you haven't already) Create a new Laravel project.
2. As 'Dokie' requires an OpenAPI specification file, you need another package to generate it. In this demo, I am using the [dedoc/scramble](https://github.com/dedoc/scramble) package. You can install it by running:
   ```bash
   composer require dedoc/scramble
   ```
3. (Optional) Publish the scramble configuration and modify it to suit your needs. (I didn't need to modify it in this project.)
4. Require the Dokie package via Composer:
   ```bash
   composer require mergehez/dokie
   ```
5. (Optional) Publish the Dokie configuration:
   ```bash
   php artisan vendor:publish --tag=dokie-config
   ```
   This will create the 'dokie.php' file in the 'config' directory. Just like in this demo project.
6. (Optional) Modify the `dokie.php` configuration file to suit your needs.
7. Visit `/dokie` in your browser to see the Dokie UI with your generated OpenAPI specification.
8. Enjoy documenting your API with Dokie!

> If you encounter any issues or have questions, feel free to open an issue.