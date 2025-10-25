<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dokie UI</title>
    <style>
        html, body, iframe {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            border: 0;
        }

        iframe {
            display: block;
            border: none;
        }
    </style>
</head>
<body>
<script>
    window.dokie = {
        currentHostname: "{{ $currentHostname }}"
    };
</script>
<iframe src="{{ asset('vendor/dokie/dokie.html') }}" style="width:100vw; height:100vh;"></iframe>
</body>
</html>

