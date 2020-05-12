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

                    Your user account does not currently have access to the Faith FM content management system.<br/><br/>
                    Please contact a system administator if you need access to this system - providing the email address you used to sign-up / log-in.
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
