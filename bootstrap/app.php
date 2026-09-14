<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CheckFeature;
use App\Http\Middleware\CheckSubscription;
use App\Http\Middleware\HandleAssociateOnboarding;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'superadmin' => SuperAdminMiddleware::class,
            'subscription.active' => CheckSubscription::class,
            'associate.onboarding' => HandleAssociateOnboarding::class,
            'feature' => CheckFeature::class,
        ]);

        // Los avisos de la pasarela no traen sesión ni token: se autentican por
        // firma. Ver App\Http\Controllers\Webhooks\BoldWebhookController.
        $middleware->validateCsrfTokens(except: [
            'webhooks/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
