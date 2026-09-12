<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Calendario de cobro — ver docs/adr/0002-interruptores-de-modulo-por-plan.md

// Día 15: se emite la cuenta de cobro (vence el 19).
Schedule::command('invoices:generate-monthly')->monthlyOn(15, '08:00');

// Avisos escalonados: víspera del corte, primer día de mora y aviso final
// antes de que se oculte el perfil.
Schedule::command('billing:send-reminders')->dailyAt('09:00');

// Oculta el perfil de quien ya pasó vencimiento + gracia.
Schedule::command('subscription:check-expiration')->daily();

// Red de seguridad del pago en línea: cierra los intentos que quedaron
// colgados para que el asociado pueda reintentar.
Schedule::command('payments:reconcile-bold')->hourly();
