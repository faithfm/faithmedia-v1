<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Laravel') }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f8f9fa;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 90%;
        }
        .logo {
            max-width: 200px;
            margin-bottom: 2rem;
        }
        h1 {
            color: #2d3748;
            margin-bottom: 1.5rem;
        }
        .version-links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            color: white;
            background-color: #4a5568;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #2d3748;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="/faithfm-colour-R4.png" alt="Faith FM logo" class="logo">
        <h1>{{ $message ?? 'Welcome to ' . config('app.name', 'Laravel') }}</h1>
        
        <div class="version-links">
            @if(isset($links))
                @foreach($links as $link)
                    <a href="{{ $link['url'] }}" class="btn">{{ $link['text'] }}</a>
                @endforeach
            @else
                <a href="/vue3" class="btn">Vue 3 Version</a>
                <a href="/vue2" class="btn">Vue 2 Version</a>
            @endif
        </div>
    </div>
</body>
</html>
