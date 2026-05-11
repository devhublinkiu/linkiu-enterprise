<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('associate:id,company_name')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'phone'         => $u->phone,
                'role'          => $u->is_superadmin ? 'superadmin' : ($u->role ?: ($u->associate_id ? 'associate' : 'admin')),
                'company_name'  => $u->associate?->company_name,
                'associate_id'  => $u->associate_id,
            ]);

        return Inertia::render('Admin/Users/Index', compact('users'));
    }

    public function updatePassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Contraseña actualizada correctamente.');
    }
}
