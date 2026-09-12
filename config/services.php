<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Bold — pasarela de pagos
    |--------------------------------------------------------------------------
    |
    | Riel 1 del motor de cobro. Ver docs/adr/0001-motor-de-cobro-unificado.md
    |
    | Sin BOLD_API_KEY el botón de pago en línea simplemente no aparece y el
    | sistema sigue funcionando con transferencia y efectivo. Eso permite subir
    | el código a producción antes de tener las credenciales.
    |
    | Los nombres de los eventos y el encabezado de la firma están aquí y no en
    | el código a propósito: son la parte del contrato de Bold que hay que
    | confirmar contra su documentación vigente, y así se ajustan sin desplegar.
    |
    */
    'bold' => [
        'api_key'        => env('BOLD_API_KEY'),
        'secret_key'     => env('BOLD_SECRET_KEY'),
        // Si Bold entrega un secreto distinto para firmar webhooks, va aquí.
        // Si no, se usa el secret_key.
        'webhook_secret' => env('BOLD_WEBHOOK_SECRET'),

        'script_url'     => env('BOLD_SCRIPT_URL', 'https://checkout.bold.co/library/boldPaymentButton.js'),
        'currency'       => env('BOLD_CURRENCY', 'COP'),

        // Encabezado donde llega la firma del webhook.
        'signature_header' => env('BOLD_SIGNATURE_HEADER', 'x-bold-signature'),

        // Eventos del webhook, confirmados con la documentación de Bold.
        // Ver docs/bold-integracion.md §2.3.
        'approved_events' => ['SALE_APPROVED'],
        'rejected_events' => ['SALE_REJECTED'],
        // Anulaciones/reembolsos: NO revierten la vigencia automáticamente;
        // se registran para revisión. VOID_APPROVED = dinero devuelto;
        // VOID_REJECTED = la anulación falló y la venta sigue en pie.
        'void_events' => ['VOID_APPROVED', 'VOID_REJECTED'],
    ],

];
