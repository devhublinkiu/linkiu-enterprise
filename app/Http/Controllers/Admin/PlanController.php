<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Plans/Index', [
            'plans' => Plan::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Plans/Form');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_semiannual' => 'required|numeric|min:0',
            'price_annual' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'limit_services' => 'required|integer|min:0',
            'limit_gallery' => 'required|integer|min:0',
            'has_priority_directory' => 'required|boolean',
            'can_download_tenders' => 'required|boolean',
            'has_job_board' => 'required|boolean',
            'has_network' => 'required|boolean',
            'has_reviews' => 'required|boolean',
            'has_priority_support' => 'required|boolean',
            'color_hex' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'grace_days' => 'required|integer|min:0',
            'signup_fee' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
        ]);

        $data['slug'] = Str::slug($data['name']);

        Plan::create($data);

        return redirect()->route('admin.plans.index')->with('success', 'Plan creado exitosamente.');
    }

    public function edit(Plan $plan)
    {
        return Inertia::render('Admin/Plans/Form', [
            'plan' => $plan
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_semiannual' => 'required|numeric|min:0',
            'price_annual' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'limit_services' => 'required|integer|min:0',
            'limit_gallery' => 'required|integer|min:0',
            'has_priority_directory' => 'required|boolean',
            'can_download_tenders' => 'required|boolean',
            'has_job_board' => 'required|boolean',
            'has_network' => 'required|boolean',
            'has_reviews' => 'required|boolean',
            'has_priority_support' => 'required|boolean',
            'color_hex' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'grace_days' => 'required|integer|min:0',
            'signup_fee' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
        ]);

        $data['slug'] = Str::slug($data['name']);

        $plan->update($data);

        return redirect()->route('admin.plans.index')->with('success', 'Plan actualizado exitosamente.');
    }

    public function destroy(Plan $plan)
    {
        if ($plan->associates()->count() > 0) {
            return redirect()->back()->with('error', 'No se puede eliminar un plan que tiene socios activos.');
        }

        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plan eliminado exitosamente.');
    }
}
