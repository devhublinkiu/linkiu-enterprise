<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;

// Endpoint del catálogo propio de ubicaciones (DANE / DIVIPOLA). Alimenta los Select de
// departamento/ciudad del formulario del asociado. Reemplaza a api-colombia.com.
// Ver plan 0007 (corte 7-B) y ADR-0005.
class LocationController extends Controller
{
    public function departments(): JsonResponse
    {
        return response()->json(
            Department::orderBy('name')->get(['id', 'code', 'name']),
        );
    }

    public function cities(Department $department): JsonResponse
    {
        return response()->json(
            $department->cities()->orderBy('name')->get(['id', 'code', 'name']),
        );
    }
}
