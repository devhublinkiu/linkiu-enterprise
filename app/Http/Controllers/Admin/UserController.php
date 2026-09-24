<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ForumReaction;
use App\Models\ForumReply;
use App\Models\ForumTopic;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $adminId = $request->user()->id;

        $users = User::with('associate:id,company_name')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'role' => $u->is_superadmin ? 'superadmin' : ($u->role ?: ($u->associate_id ? 'associate' : 'admin')),
                'company_name' => $u->associate?->company_name,
                'associate_id' => $u->associate_id,
                // Se puede eliminar solo si no es admin, no tiene empresa y no es uno mismo.
                'can_delete' => $this->deletableReason($u, $adminId) === null,
                'delete_hint' => $this->deletableReason($u, $adminId),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'spam_count' => $this->spamQuery()->count(),
        ]);
    }

    public function updatePassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Contraseña actualizada correctamente.');
    }

    /**
     * Elimina un usuario suelto. No permite eliminar admins, ni a uno mismo, ni a
     * un usuario con empresa asociada (esa baja va por el flujo de asociados), ni
     * a quien tenga actividad en la Red CAMEP.
     */
    public function destroy(Request $request, User $user)
    {
        if ($reason = $this->deletableReason($user, $request->user()->id)) {
            return back()->with('error', $reason);
        }

        if ($this->hasForumActivity($user)) {
            return back()->with('error', 'No se puede eliminar: el usuario tiene actividad en la Red CAMEP.');
        }

        $email = $user->email;
        $user->delete();

        return back()->with('success', "Usuario {$email} eliminado.");
    }

    /**
     * Borra en lote los registros de spam legado (bots anteriores al OTP): nombre
     * de gibberish (sin espacio), sin verificar, sin empresa y sin actividad. Deja
     * un respaldo CSV en storage/app antes de borrar (User no tiene SoftDeletes).
     */
    public function purgeSpam(Request $request)
    {
        $spam = $this->spamQuery()->get(['id', 'name', 'email', 'created_at']);

        if ($spam->isEmpty()) {
            return back()->with('info', 'No hay registros de spam para eliminar.');
        }

        $file = 'purge-spam-'.now()->format('Ymd-His').'.csv';
        $csv = "id,name,email,created_at\n";
        foreach ($spam as $u) {
            $name = str_replace('"', '""', (string) $u->name);
            $csv .= "{$u->id},\"{$name}\",{$u->email},{$u->created_at}\n";
        }
        Storage::disk('local')->put($file, $csv);

        $count = User::whereIn('id', $spam->pluck('id'))->delete();

        return back()->with('success', "{$count} registros de spam eliminados. Respaldo: storage/app/{$file}");
    }

    /**
     * Motivo por el que NO se puede eliminar, o null si sí se puede.
     */
    private function deletableReason(User $user, int $adminId): ?string
    {
        return match (true) {
            $user->id === $adminId => 'No puedes eliminar tu propia cuenta.',
            $user->isAdmin() => 'No puedes eliminar a un administrador.',
            $user->associate_id !== null => 'Tiene una empresa asociada. Elimina o desvincula la empresa primero.',
            default => null,
        };
    }

    private function hasForumActivity(User $user): bool
    {
        return ForumTopic::where('user_id', $user->id)->exists()
            || ForumReply::where('user_id', $user->id)->exists()
            || ForumReaction::where('user_id', $user->id)->exists();
    }

    /**
     * Conjunto seguro de spam legado. Se usa para el contador y para el borrado en lote.
     * Se consulta por `user_id` de los modelos de foro (sin la relación dinámica).
     *
     * @return Builder<User>
     */
    private function spamQuery(): Builder
    {
        return User::query()
            ->where('name', 'not like', '% %') // gibberish de una sola palabra
            ->whereNull('email_verified_at')
            ->whereNull('associate_id')
            ->where('is_superadmin', false)
            ->whereNotIn('id', ForumTopic::query()->select('user_id')->whereNotNull('user_id'))
            ->whereNotIn('id', ForumReply::query()->select('user_id')->whereNotNull('user_id'))
            ->whereNotIn('id', ForumReaction::query()->select('user_id')->whereNotNull('user_id'));
    }
}
