<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $data = $request->validate([
            'bank_name'            => 'required|string|max:255',
            'account_type'         => 'required|in:ahorros,corriente',
            'account_number'       => 'required|string|max:50',
            'holder_name'          => 'required|string|max:255',
            'holder_document'      => 'required|string|max:50',
            'holder_document_type' => 'required|in:NIT,CC',
            'color_hex'            => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'is_active'            => 'required|boolean',
            'order'                => 'integer|min:0',
        ]);

        BankAccount::create($data);

        return redirect()->route('admin.bank-accounts.index')
            ->with('success', 'Cuenta bancaria agregada correctamente.');
    }

    public function edit(BankAccount $bankAccount)
    {
        return Inertia::render('Admin/BankAccounts/Form', [
            'account' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $data = $request->validate([
            'bank_name'            => 'required|string|max:255',
            'account_type'         => 'required|in:ahorros,corriente',
            'account_number'       => 'required|string|max:50',
            'holder_name'          => 'required|string|max:255',
            'holder_document'      => 'required|string|max:50',
            'holder_document_type' => 'required|in:NIT,CC',
            'color_hex'            => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'is_active'            => 'required|boolean',
            'order'                => 'integer|min:0',
        ]);

        $bankAccount->update($data);

        return redirect()->route('admin.bank-accounts.index')
            ->with('success', 'Cuenta bancaria actualizada correctamente.');
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();

        return redirect()->route('admin.bank-accounts.index')
            ->with('success', 'Cuenta bancaria eliminada.');
    }
}
