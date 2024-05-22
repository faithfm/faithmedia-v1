@extends('layouts.app')

@section('content')
<style>
    .error-container {
        font-family: Arial, sans-serif;
        background-color: #f7fafc;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        /* Align items at the top */
        height: 00vh;
        margin: 0;
    }

    .error-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px;
        max-width: 1000px;
        width: 100%;
        background-color: #fff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    .error-image img {
        height: 248px;
        width: 248px;
    }

    .error-content {
        text-align: center;
        margin-top: 16px;
    }

    .error-title {
        font-size: 24px;
        font-weight: bold;
        color: #1a202c;
    }

    .error-description {
        margin-top: 8px;
        font-size: 18px;
        color: #4a5568;
    }

    .error-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* Center align the buttons */
        margin-top: 16px;
        width: 100%;
    }

    .error-buttons button {
        padding: 10px;
        margin: 4px 0;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        max-width: 20rem;
        /* Set max-width for buttons */
        width: 100%;
        /* Ensure the button stretches to its max width */
    }


    .error-buttons button.back {
        background-color: #e2e8f0;
        color: #e53e3e;
    }

    .error-buttons button.back:hover {
        background-color: #cbd5e0;
    }

    .error-buttons button.login {
        background-color: #e2e8f0;
        color: #e53e3e;
    }

    .error-buttons button.login:hover {
        background-color: #cbd5e0;
    }

    @media (min-width: 768px) {
        .error-box {
            flex-direction: row;
            padding: 32px;
        }

        .error-image {
            margin-right: 48px;
        }

        .error-content {
            text-align: left;
            margin-top: 0;
        }

        .error-buttons {
            flex-direction: row;
            justify-content: center;
        }

        .error-buttons button {
            flex: 1;
            margin-right: 8px;
        }
    }
</style>

<div class="error-container">
    <div class="error-box">
        <div class="error-image">
            <img src="/error-images/{{$status}}.png" alt="Error Image" />
        </div>
        <div class="error-content">
            <h2 class="error-title">
                {{$statusMessages['title']}}
            </h2>
            <p class="error-description">
                {{$statusMessages['description']}}
            </p>
            <div class="error-buttons">
                @unless ($status == 401)
                <button class="back" onclick="goBack()">
                    Go back
                </button>
                @endunless
                @if ($status == 401)
                <button class="login" onclick="window.location.href='/login'">
                    Login
                </button>
                @endif
            </div>
        </div>
    </div>
</div>

<script>
    function goBack() {
        window.history.back();
    }
</script>
@endsection