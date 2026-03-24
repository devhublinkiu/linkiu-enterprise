<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BienesServiciosEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BienesServiciosEmpresaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/BusinessServices/Companies/Index', [
            'companies' => BienesServiciosEmpresa::latest()->get()->map(function ($company) {
                return [
                    'id' => $company->id,
                    'nombre' => $company->nombre,
                    'departamento' => $company->departamento,
                    'ciudad' => $company->ciudad,
                    'estado' => $company->estado,
                    'logo_url' => $company->getFirstMediaUrl('logo'),
                ];
            }),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/BusinessServices/Companies/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'departamento' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:255',
            'estado' => 'required|in:activo,inactivo',
            'logo' => 'nullable|image|max:2048',
        ]);

        $company = BienesServiciosEmpresa::create($validated);

        if ($request->hasFile('logo')) {
            $company->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        return redirect()->route('admin.bienes-servicios.companies.index')
            ->with('success', 'Empresa creada correctamente.');
    }

    public function edit(BienesServiciosEmpresa $company)
    {
        return Inertia::render('Admin/BusinessServices/Companies/Form', [
            'company' => array_merge($company->toArray(), [
                'logo_url' => $company->getFirstMediaUrl('logo'),
            ]),
        ]);
    }

    public function update(Request $request, BienesServiciosEmpresa $company)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'departamento' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:255',
            'estado' => 'required|in:activo,inactivo',
            'logo' => 'nullable|image|max:2048',
        ]);

        $company->update($validated);

        if ($request->hasFile('logo')) {
            $company->clearMediaCollection('logo');
            $company->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        return redirect()->route('admin.bienes-servicios.companies.index')
            ->with('success', 'Empresa actualizada correctamente.');
    }

    public function destroy(BienesServiciosEmpresa $company)
    {
        $company->delete();
        return redirect()->route('admin.bienes-servicios.companies.index')
            ->with('success', 'Empresa eliminada correctamente.');
    }
}
