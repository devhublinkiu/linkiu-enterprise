<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageGroupRequest;
use App\Models\Associate;
use App\Models\MessageGroup;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

/**
 * Grupos de mensajería (plan 0026, corte 4): listas con nombre que el admin crea
 * seleccionando asociados. Solo admin (MessageGroupPolicy).
 */
class MessageGroupController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', MessageGroup::class);

        return Inertia::render('Admin/Mensajes/Grupos', [
            'groups' => MessageGroup::withCount('associates')
                ->with('associates:id')
                ->latest()
                ->get()
                ->map(fn ($g) => [
                    'id' => $g->id,
                    'name' => $g->name,
                    'count' => $g->associates_count,
                    'associate_ids' => $g->associates->pluck('id')->values(),
                ]),
            'associates' => Associate::orderBy('company_name')->get(['id', 'company_name'])
                ->map(fn ($a) => ['id' => $a->id, 'name' => $a->company_name]),
        ]);
    }

    public function store(StoreMessageGroupRequest $request)
    {
        $this->authorize('create', MessageGroup::class);

        $group = MessageGroup::create([
            'name' => $request->validated('name'),
            'created_by' => $request->user()->id,
        ]);
        $group->associates()->sync($request->validated('associate_ids'));

        return back()->with('success', 'Grupo creado.');
    }

    public function update(StoreMessageGroupRequest $request, MessageGroup $group)
    {
        $this->authorize('update', $group);

        $group->update(['name' => $request->validated('name')]);
        $group->associates()->sync($request->validated('associate_ids'));

        return back()->with('success', 'Grupo actualizado.');
    }

    public function destroy(MessageGroup $group)
    {
        $this->authorize('delete', $group);

        $group->delete();

        return back()->with('success', 'Grupo eliminado.');
    }
}
