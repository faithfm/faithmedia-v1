<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Vue Music Player</title>

    <!-- Scripts -->
    <script>
        window.user = {!! json_encode(Auth::user()) !!};
        window.config = { 
            MEDIA_DOWNLOAD_BASE_OGG: "{{ env('MEDIA_DOWNLOAD_BASE_OGG') }}",
            MEDIA_DOWNLOAD_BASE_MP3: "{{ env('MEDIA_DOWNLOAD_BASE_MP3') }}",
            MEDIA_DOWNLOAD_BASE_ORIG: "{{ env('MEDIA_DOWNLOAD_BASE_ORIG') }}",
        };
    </script>
    <script src="{{ asset('js/player_app.js') }}" defer></script>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
    <div id="app">
        <v-app id="player">
        </v-app>
    </div>
    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
    </form>
</body>
</html>