<?php
/*
 * dd() with headers
 */
if (!function_exists('ddh')) {
    function ddh($var)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: *');
        header('Access-Control-Allow-Headers: *');
        dd($var);
    }
}

/*
 * dump() with headers
 */
if (!function_exists('dumph')) {
    function dumph($var)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: *');
        header('Access-Control-Allow-Headers: *');
        dump($var);
    }
}

// if (!function_exists('dd')) {
//     /**
//      * Dump the passed variables and end the script.
//      *
//      * @param  mixed  $args
//      * @return void
//      */
//     function dd(...$args)
//     {
//         header('Access-Control-Allow-Origin: *');
//         header('Access-Control-Allow-Methods: *');
//         header('Access-Control-Allow-Headers: *');
//         http_response_code(500);
//
//         foreach ($args as $x) {
//             (new Symfony\Component\VarDumper\VarDumper)->dump($x);
//         }
//
//         die(1);
//     }
// } else {
//     echo('dd() function already defined');
// }