<?php

use App\Models\BoldSetting;
use App\Models\User;
use App\Services\Bold\BoldGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('isEnabled usa las llaves del entorno activo y el interruptor', function () {
    // Sin fila ni env: apagado.
    expect(app(BoldGateway::class)->isEnabled())->toBeFalse();

    BoldSetting::create([
        'test_api_key' => 'k',
        'test_secret_key' => 's',
        'environment' => 'test',
        'is_active' => true,
    ]);
    expect(app(BoldGateway::class)->isEnabled())->toBeTrue();
    expect(app(BoldGateway::class)->environment())->toBe('test');

    // Cambiar el entorno activo a producción, que no tiene llaves: apagado.
    BoldSetting::query()->update(['environment' => 'production']);
    expect(app(BoldGateway::class)->isEnabled())->toBeFalse();

    // Y el interruptor apaga aunque haya llaves.
    BoldSetting::query()->update(['environment' => 'test', 'is_active' => false]);
    expect(app(BoldGateway::class)->isEnabled())->toBeFalse();
});

it('guarda las llaves por entorno cifradas y nunca las expone al frontend', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->patch(route('admin.integrations.bold.update'), [
            'is_active' => true,
            'environment' => 'production',
            'production_api_key' => 'API123',
            'production_secret_key' => 'SEC456',
        ])
        ->assertRedirect();

    $setting = BoldSetting::current();
    expect($setting->production_secret_key)->toBe('SEC456');   // el cast descifra
    expect($setting->environment)->toBe('production');
    expect(DB::table('bold_settings')->value('production_secret_key'))->not->toBe('SEC456'); // cifrado en reposo

    $this->actingAs($admin)
        ->get(route('admin.integrations.index'))
        ->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Integrations/Index')
            ->where('bold.has.production_secret_key', true)
            ->has('bold.webhook_url')
            ->missing('bold.production_secret_key')
        );
});

it('un valor en blanco conserva el secreto existente', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    BoldSetting::create([
        'test_api_key' => 'A',
        'test_secret_key' => 'OLD',
        'environment' => 'test',
        'is_active' => true,
    ]);

    $this->actingAs($admin)->patch(route('admin.integrations.bold.update'), [
        'is_active' => true,
        'environment' => 'test',
        'test_api_key' => '',
        'test_secret_key' => '',
    ]);

    expect(BoldSetting::current()->test_secret_key)->toBe('OLD');
});

it('un admin (no superadmin) también entra a integraciones', function () {
    $admin = User::factory()->create(['is_superadmin' => false, 'role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('admin.integrations.index'))
        ->assertOk();
});

it('el diagnóstico de firma es seguro y distingue escáner, esquema y llave', function () {
    BoldSetting::create([
        'test_secret_key' => 's3cr3t',
        'environment' => 'test',
        'is_active' => true,
    ]);
    $bold = app(BoldGateway::class);
    $raw = '{"reference":"ABC","status":"approved"}';
    $valid = hash_hmac('sha256', base64_encode($raw), 's3cr3t');

    // Firma correcta: coincide, formato hex, longitudes 64.
    $ok = $bold->signatureDiagnostics($raw, $valid);
    expect($ok['secret_configured'])->toBeTrue();
    expect($ok['signature_present'])->toBeTrue();
    expect($ok['received_format'])->toBe('hex');
    expect($ok['received_len'])->toBe(64);
    expect($ok['expected_len'])->toBe(64);
    expect($ok['matches'])->toBeTrue();
    // La muestra es del hash, nunca del secreto.
    expect($ok['received_sample'])->not->toContain('s3cr3t');

    // Sin header → parece un escáner (ruido).
    $none = $bold->signatureDiagnostics($raw, null);
    expect($none['signature_present'])->toBeFalse();
    expect($none['received_format'])->toBe('ausente');
    expect($none['matches'])->toBeFalse();

    // Firma en base64 (esquema equivocado) → no coincide y se detecta el formato.
    $wrong = $bold->signatureDiagnostics($raw, base64_encode('otra-cosa-xyz'));
    expect($wrong['received_format'])->toBe('base64');
    expect($wrong['matches'])->toBeFalse();
});

it('sign() produce una firma que verifySignature() acepta', function () {
    BoldSetting::create([
        'test_secret_key' => 'llave-de-test',
        'environment' => 'test',
        'is_active' => true,
    ]);
    $bold = app(BoldGateway::class);
    $raw = '{"type":"SALE_APPROVED","data":{"metadata":{"reference":"CAMEP-1-AAA"}}}';

    $sig = $bold->sign($raw);
    expect($sig)->not->toBeNull();
    expect($bold->verifySignature($raw, $sig))->toBeTrue();
});

it('payments:simulate-bold falla si la referencia no existe', function () {
    $this->artisan('payments:simulate-bold', ['reference' => 'NO-EXISTE'])
        ->expectsOutputToContain('No hay pago Bold con referencia NO-EXISTE.')
        ->assertExitCode(1);
});
