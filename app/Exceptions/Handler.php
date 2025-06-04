<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @return void
     *
     * @throws \Exception
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        // Get status code (from Laravel default error page)
        $response = parent::render($request, $e);
        $status = $response->getStatusCode();
        $message = $e->getMessage();
        $debug = config('app.debug');

        // Status messages
        $statusMessages = [
            401 => [
                'title' => '401: Not Logged In',
                'description' => "Whoa there, wanderer! Are you part of this flock? I can't seem to match you with any ear tag in our pasture. \n\n If you’re a new lamb around here, let's get you registered and tagged, so you can join the herd. \n\n If you've just misplaced your tag, no problem – just log in so I can recognize you, and you'll be grazing with the rest of us in no time! 🐑",
            ],
            403 => [
                'title' => '403: Forbidden',
                'description' => "Baa-d news, friend! Looks like you're trying to graze in a restricted field. Let me just check your ear tag... \n Hmm, no access for you just yet. This meadow is for the flock with the right clearance. \n If you think this is a mistake, better bleat to the shepherd for assistance - he knows how to herd you through the right gate!",
            ],
            404 => [
                'title' => '404: Page Not Found',
                'description' => "Oh, ewe seem to have wandered off the path! This part of the pasture doesn't have what you're looking for. \n\n Maybe the page was herded to another location, or perhaps it never existed. No need to feel sheepish though, it happens to the best of us. \n\n Let's trot back and consult the shepherd, or try navigating back to the barn. Stay wooly, my friend!",
            ],
            500 => [
                'title' => '500: Server Error',
                'description' => "Baaa-d news! It looks like our sheep are all in a jumble and the shepherd's a bit flustered. We're facing some unexpected problems behind the barn door. \n\n Feel free to graze around the edges, come back later, or have a chat with the sheperd.  🐑",
            ],
            503 => [
                'title' => '503: Service Unavailable',
                'description' => "Hold your hooves! Our pasture is currently undergoing a bit of herd management – seems like the shepherd is corralling us for a headcount or some much-needed pasture maintenance.  \n\n But don’t fret, there will be plenty of grazing to be had once the fields are open again! 🐑",
            ],
        ];

        // Use our custom error page for known status codes... but don't prevent Laravel from handling other status codes - especially in debug mode
        if (($status == 401) ||
            ($status == 403) ||
            ($status == 404) ||
            ($status == 503) ||
            (($status == 500) && !$debug)
        ) {
            // Return our custom error page
            return Inertia::render('Error', [
                'status' => $status, 
                'exceptionMessage' => $message
            ])
            ->toResponse($request)
            ->setStatusCode($status);
    }
        // Return the default Laravel error page
        return $response;
    }
}
