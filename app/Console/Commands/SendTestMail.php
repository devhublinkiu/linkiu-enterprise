<?php

namespace App\Console\Commands;

use App\Models\Associate;
use App\Models\ContactSubmission;
use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Models\ForumTopic;
use App\Models\Invoice;
use App\Models\Licitacion;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestMail extends Command
{
    protected $signature = 'mail:test
                            {template? : Alias de la plantilla (ej: welcome, approved, new-invoice). Omite para ver la lista.}
                            {to? : Email destinatario}
                            {--id= : ID específico del registro (Associate/Invoice/etc) si no quieres el último}';

    protected $description = 'Envía un correo de prueba usando una plantilla del proyecto con datos reales (último registro) o por id.';

    /**
     * Mapa: alias → [MailableClass, resolverMethod]
     */
    private array $templates = [
        'welcome'                => [\App\Mail\WelcomeUser::class,                'resolveUser'],
        'approved'               => [\App\Mail\AssociateApproved::class,          'resolveAssociate'],
        'audit-rejected'         => [\App\Mail\AssociateAuditRejected::class,     'resolveAuditRejected'],
        'audit-approved'         => [\App\Mail\SectionAuditApproved::class,       'resolveAuditApproved'],
        'field-change-requested' => [\App\Mail\AssociateFieldChangeRequested::class, 'resolveAuditRejected'],
        'docs-submitted'         => [\App\Mail\AssociateDocsSubmitted::class,     'resolveAssociate'],
        'new-invoice'            => [\App\Mail\NewInvoiceGenerated::class,        'resolveInvoice'],
        'payment-approved'       => [\App\Mail\PaymentApproved::class,            'resolvePaymentRequest'],
        'payment-rejected'       => [\App\Mail\PaymentRejected::class,            'resolvePaymentRequest'],
        'payment-proof'          => [\App\Mail\PaymentProofSubmitted::class,      'resolvePaymentRequest'],
        'subscription-expiring'  => [\App\Mail\SubscriptionExpiringSoon::class,   'resolveAssociateWithDays'],
        'subscription-expired'   => [\App\Mail\SubscriptionExpired::class,        'resolveAssociate'],
        'new-tender'             => [\App\Mail\NewTenderPublished::class,         'resolveTender'],
        'tender-updated'         => [\App\Mail\TenderUpdatedAlert::class,         'resolveTender'],
        'forum-reply'            => [\App\Mail\NewForumReply::class,              'resolveForumReply'],
        'forum-new-topic'        => [\App\Mail\NewForumTopicAlert::class,         'resolveForumTopic'],
        'forum-report'           => [\App\Mail\ForumReportAlert::class,           'resolveForumReport'],
        'contact-admin'          => [\App\Mail\ContactReceivedToAdmin::class,     'resolveContact'],
        'contact-user'           => [\App\Mail\ContactConfirmationToUser::class,  'resolveContact'],
    ];

    public function handle(): int
    {
        $template = $this->argument('template');
        $to       = $this->argument('to');

        if (!$template) {
            $this->showList();
            return self::SUCCESS;
        }

        if (!isset($this->templates[$template])) {
            $this->error("Plantilla desconocida: {$template}");
            $this->showList();
            return self::FAILURE;
        }

        if (!$to) {
            $this->error('Debes indicar el email destinatario. Ej: php artisan mail:test welcome you@example.com');
            return self::FAILURE;
        }

        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error("Email inválido: {$to}");
            return self::FAILURE;
        }

        [$class, $resolver] = $this->templates[$template];

        try {
            $args = $this->{$resolver}();
        } catch (\Throwable $e) {
            $this->error("No se pudo construir el mailable: " . $e->getMessage());
            return self::FAILURE;
        }

        $this->info("Enviando '{$template}' (" . class_basename($class) . ") a {$to}…");

        try {
            Mail::to($to)->send(new $class(...$args));
        } catch (\Throwable $e) {
            $this->error('Error al enviar: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->info('Listo. Revisa el buzón (y la carpeta de spam).');
        return self::SUCCESS;
    }

    private function showList(): void
    {
        $this->line('Plantillas disponibles:');
        foreach (array_keys($this->templates) as $alias) {
            $this->line('  • ' . $alias);
        }
        $this->newLine();
        $this->line('Uso:  php artisan mail:test <plantilla> <email> [--id=N]');
    }

    // ─────────────────────────── Resolvers ───────────────────────────

    private function resolveUser(): array
    {
        $user = $this->findOrLatest(User::class);
        return [$user];
    }

    private function resolveAssociate(): array
    {
        $associate = $this->findOrLatest(Associate::class);
        return [$associate];
    }

    private function resolveAssociateWithDays(): array
    {
        return [$this->findOrLatest(Associate::class), 5];
    }

    private function resolveAuditRejected(): array
    {
        return [
            $this->findOrLatest(Associate::class),
            'basic_info',
            'Por favor verifica el campo "razón social"; no coincide con el RUT cargado.',
        ];
    }

    private function resolveAuditApproved(): array
    {
        return [$this->findOrLatest(Associate::class), 'basic_info', false];
    }

    private function resolveInvoice(): array
    {
        return [$this->findOrLatest(Invoice::class)->load('associate')];
    }

    private function resolvePaymentRequest(): array
    {
        return [$this->findOrLatest(PaymentRequest::class)->load('plan', 'associate')];
    }

    private function resolveTender(): array
    {
        return [$this->findOrLatest(Licitacion::class)];
    }

    private function resolveForumReply(): array
    {
        return [$this->findOrLatest(ForumReply::class)];
    }

    private function resolveForumTopic(): array
    {
        return [$this->findOrLatest(ForumTopic::class)];
    }

    private function resolveForumReport(): array
    {
        return [$this->findOrLatest(ForumReport::class)];
    }

    private function resolveContact(): array
    {
        return [$this->findOrLatest(ContactSubmission::class)];
    }

    private function findOrLatest(string $modelClass)
    {
        $id = $this->option('id');

        $model = $id
            ? $modelClass::find($id)
            : $modelClass::latest('id')->first();

        if (!$model) {
            $hint = $id ? "con id={$id}" : "(no hay registros en la tabla)";
            throw new \RuntimeException("No se encontró ningún " . class_basename($modelClass) . " {$hint}");
        }

        return $model;
    }
}
