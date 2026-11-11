<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Métodos de pago que CAMEP muestra al asociado para pagar la membresía:
 * cuenta bancaria, llave Bre-B o QR (imagen en disco público).
 */
class BankAccountController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/BankAccounts/Index', [
            'accounts' => BankAccount::orderBy('order')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/BankAccounts/Form');
    }

    public function store(Request $request)
    {
        $validated = $this->validateByType($request, true);
        BankAccount::create($this->dataFor($request, $validated));

        return redirect()->route('admin.bank-accounts.index')
            ->with('success', 'Método de pago agregado correctamente.');
    }

    public function edit(BankAccount $bankAccount)
    {
        return Inertia::render('Admin/BankAccounts/Form', [
            'account' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $validated = $this->validateByType($request, false);
        $bankAccount->update($this->dataFor($request, $validated, $bankAccount));

        return redirect()->route('admin.bank-accounts.index')
            ->with('success', 'Método de pago actualizado correctamente.');
    }

    public function destroy(BankAccount $bankAccount)
    {
        if ($bankAccount->qr_path) {
            Storage::disk('public')->delete($bankAccount->qr_path);
        }
        $bankAccount->delete();

        return redirect()->route('admin.bank-accounts.index')
            ->with('success', 'Método de pago eliminado.');
    }

    /**
     * Reglas según el tipo. En QR la imagen es obligatoria solo al crear.
     */
    private function validateByType(Request $request, bool $creating): array
    {
        $rules = [
            'type' => 'required|in:cuenta,bre_b,qr',
            'is_active' => 'required|boolean',
        ];

        $rules += match ($request->input('type')) {
            'cuenta' => [
                'bank_name' => 'required|string|max:255',
                'account_type' => 'required|in:ahorros,corriente',
                'account_number' => 'required|string|max:50',
                'holder_name' => 'required|string|max:255',
                'holder_document' => 'required|string|max:50',
                'holder_document_type' => 'required|in:NIT,CC',
            ],
            'bre_b' => [
                'payment_key' => 'required|string|max:120',
                'holder_name' => 'required|string|max:255',
            ],
            'qr' => [
                'bank_name' => 'nullable|string|max:255', // etiqueta, p. ej. "Nequi"
                'qr' => ($creating ? 'required|' : 'nullable|').'image|max:4096',
            ],
            default => [],
        };

        return $request->validate($rules);
    }

    /**
     * Arma los atributos a guardar según el tipo; limpia los campos que el tipo
     * no usa y gestiona el archivo del QR (reemplazo/limpieza en disco público).
     */
    private function dataFor(Request $request, array $validated, ?BankAccount $existing = null): array
    {
        $type = $validated['type'];

        $data = [
            'type' => $type,
            'is_active' => $validated['is_active'],
            'bank_name' => null,
            'account_type' => null,
            'account_number' => null,
            'holder_name' => null,
            'holder_document' => null,
            'holder_document_type' => null,
            'payment_key' => null,
            'qr_path' => $existing?->qr_path,
        ];

        if ($type === 'cuenta') {
            $data['bank_name'] = $validated['bank_name'];
            $data['account_type'] = $validated['account_type'];
            $data['account_number'] = $validated['account_number'];
            $data['holder_name'] = $validated['holder_name'];
            $data['holder_document'] = $validated['holder_document'];
            $data['holder_document_type'] = $validated['holder_document_type'];
        } elseif ($type === 'bre_b') {
            $data['payment_key'] = $validated['payment_key'];
            $data['holder_name'] = $validated['holder_name'];
        } elseif ($type === 'qr') {
            $data['bank_name'] = $validated['bank_name'] ?? null; // etiqueta
            if ($request->hasFile('qr')) {
                if ($existing?->qr_path) {
                    Storage::disk('public')->delete($existing->qr_path);
                }
                $data['qr_path'] = $request->file('qr')->store('bank-qr', 'public');
            }
        }

        // Si dejó de ser QR, borrar el archivo viejo.
        if ($type !== 'qr' && $existing?->qr_path) {
            Storage::disk('public')->delete($existing->qr_path);
            $data['qr_path'] = null;
        }

        return $data;
    }
}
