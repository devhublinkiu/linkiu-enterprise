<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Ajustes globales de cobro (día de corte y prórroga) editables por el admin.
 * Fila única (BillingSetting). El resto del motor los lee de ahí.
 */
class BillingSettingController extends Controller
{
    public function edit()
    {
        $s = BillingSetting::current();

        return Inertia::render('Admin/BillingSettings/Edit', [
            'settings' => [
                'cutoff_day' => $s->cutoff_day ?: BillingSetting::DEFAULT_CUTOFF_DAY,
                'grace_days' => (int) $s->grace_days,
            ],
        ]);
    }

    public function update(Request $request)
    {
        // Tope en 28 para que el día de corte exista en todos los meses.
        $data = $request->validate([
            'cutoff_day' => 'required|integer|min:1|max:28',
            'grace_days' => 'required|integer|min:0|max:60',
        ]);

        $s = BillingSetting::query()->first() ?? new BillingSetting;
        $s->fill($data)->save();
        BillingSetting::forget();

        return back()->with('success', 'Ajustes de cobro actualizados.');
    }
}
