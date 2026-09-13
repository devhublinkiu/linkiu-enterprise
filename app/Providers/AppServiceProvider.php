<?php

namespace App\Providers;

use App\Listeners\EnsureEmailPlainText;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Entregabilidad de correo (plan 0004 §6/4K): Reply-To a un buzón
        // monitoreado y parte de texto plano automática en todos los envíos.
        if ($replyTo = config('mail.reply_to.address')) {
            Mail::alwaysReplyTo($replyTo, config('mail.reply_to.name'));
        }

        Event::listen(MessageSending::class, EnsureEmailPlainText::class);
    }
}
