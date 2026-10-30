<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Calendario de cobro — ver docs/adr/0002-interruptores-de-modulo-por-plan.md

// Se emite la cuenta de cobro EL DÍA DE CORTE (global, editable por el admin).
// Como el día es configurable, el comando corre a diario y él mismo decide si
// hoy toca (compara con BillingSetting::cutoffDay()).
Schedule::command('invoices:generate-monthly')->dailyAt('08:00');

// Avisos escalonados: víspera del corte, primer día de mora y aviso final
// antes de que se oculte el perfil.
Schedule::command('billing:send-reminders')->dailyAt('09:00');

// Oculta el perfil de quien ya pasó vencimiento + gracia.
Schedule::command('subscription:check-expiration')->daily();

// Red de seguridad del pago en línea: cierra los intentos que quedaron
// colgados para que el asociado pueda reintentar.
Schedule::command('payments:reconcile-bold')->hourly();
