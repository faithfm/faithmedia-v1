@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Home</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    @guest
                        You are not logged in.
                    @else
                        @can('use-app')
                            Welcome to the {{ config('app.name', 'Laravel') }} system.<br/><br/>
                            <a class="btn btn-primary" href="/">Launch app...</a>
                        @else
                            Your user account does not currently have access to the Faith FM content management system.<br/><br/>
                            Please contact a system administator if you need access to this system - providing the email address you used to sign-up / log-in.
                        @endcan
                    @endguest
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
