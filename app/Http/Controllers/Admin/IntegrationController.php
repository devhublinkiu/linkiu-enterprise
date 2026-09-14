<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BoldSetting;
use App\Services\Bold\BoldGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Integraciones de terceros (por ahora, Bold). Solo superadmin.
 *
 * Los secretos se guardan cifrados en `bold_settings` y NUNCA se devuelven al
 * frontend: solo se informa si están configurados. Ver plan 0019.
 */
class IntegrationController extends Controller
{
    public function __construct(private BoldGateway $bold) {}

    /** Campos de secreto que administra la pantalla. */
    private const SECRET_FIELDS = [
        'test_api_key',
        'test_secret_key',
        'production_api_key',
        'production_secret_key',
        'webhook_secret',
    ];

    public function index()
    {
        $s = BoldSetting::current();

        // Solo se informa si cada secreto está configurado; nunca se devuelve.
        $has = [];
        foreach (self::SECRET_FIELDS as $field) {
            $has[$field] = filled($s?->{$field});
        }

        return Inertia::render('Admin/Integrations/Index', [
            'bold' => [
                'is_active' => $this->bold->isActive(),
                'enabled' => $this->bold->isEnabled(),
                'environment' => $this->bold->environment(),
                'has' => $has,
                // La URL del webhook la suministramos nosotros; el admin la pega en Bold.
                'webhook_url' => route('webhooks.bold'),
                'currency' => config('services.bold.currency', 'COP'),
            ],
        ]);
    }

    public function updateBold(Request $request)
    {
        $data = $request->validate([
            'is_active' => 'required|boolean',
            'environment' => 'required|in:test,production',
            'test_api_key' => 'nullable|string|max:255',
            'test_secret_key' => 'nullable|string|max:255',
            'production_api_key' => 'nullable|string|max:255',
            'production_secret_key' => 'nullable|string|max:255',
            'webhook_secret' => 'nullable|string|max:255',
        ]);

        $setting = BoldSetting::current() ?? new BoldSetting;
        $setting->is_active = $data['is_active'];
        $setting->environment = $data['environment'];

        // Un secreto solo se actualiza si llega un valor; dejarlo en blanco
        // conserva el actual (el formulario nunca recibe el secreto de vuelta).
        foreach (self::SECRET_FIELDS as $field) {
            if (! empty($data[$field])) {
                $setting->{$field} = $data[$field];
            }
        }

        $setting->save();

        return back()->with('success', 'Integración de Bold actualizada.');
    }
}
