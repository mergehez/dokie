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
   > see [config/dokie.php](./config/dokie.php) for configuration options.
4. Visit `/dokie` in your browser.

## Features

- **OpenAPI Support**: Automatically generates the UI based on OpenAPI specifications.
- **Configurable**: Set predefined variables, headers, and postscripts.
- **Hostname Switching**: Easily switch between different hostnames for testing.
- **Favorites**: Mark endpoints as favorites for quick access.
- **Environment Variables**: Add/remove environment variables to manage sensitive data like API keys.
- **Global headers**: Set global headers for all requests.
- **Postscripts**: Add custom scripts that run after a request is made, allowing you to set environment variables or global headers based on the response. (JavaScript)
- **Endpoint Configuration**: Easily add path/query parameters, headers and body to requests. You can use environment variables just like in Postman.

> Note that changes are stored in your local machine and not shared with other people using the same project. Following information is stored in the browser's indexedDB:
> - Environment variables
> - Global headers
> - Favorite endpoints
> - Current hostname
> - Endpoint specific: Path/Query parameters, Headers and Postscript

## Screenshots

![Screenshot 1](https://github.com/mergehez/dokie/blob/main/ui/src/assets/screenshot1.png?raw=true)
![Screenshot 2](https://github.com/mergehez/dokie/blob/main/ui/src/assets/screenshot2.png?raw=true)

## Contributing

Feel free to contribute to the project by creating issues or pull requests.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
Feel free to use, modify, and distribute this code as per the terms of the license.
