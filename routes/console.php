<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Generate monthly "cuentas de cobro" on the 15th (payment due on the 19th)
Schedule::command('invoices:generate-monthly')->monthlyOn(15, '08:00');

// Run subscription expiration check daily at midnight (respects each plan's grace_days)
Schedule::command('subscription:check-expiration')->daily();
