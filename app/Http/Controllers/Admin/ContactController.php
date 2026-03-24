<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Display a listing of submissions.
     */
    public function index()
    {
        return Inertia::render('Admin/Contacts/Index', [
            'submissions' => ContactSubmission::latest()->paginate(10)
        ]);
    }

    /**
     * Display the specified submission.
     */
    public function show(ContactSubmission $contact)
    {
        return Inertia::render('Admin/Contacts/Show', [
            'contact' => $contact
        ]);
    }

    /**
     * Update the status of a submission.
     */
    public function updateStatus(Request $request, ContactSubmission $contact)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,reviewing,resolved,declined',
            'admin_notes' => 'nullable|string',
        ]);

        $contact->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
            'resolved_at' => in_array($validated['status'], ['resolved', 'declined']) ? now() : null,
        ]);

        return back()->with('success', 'Estado actualizado correctamente.');
    }

    /**
     * Remove the specified submission.
     */
    public function destroy(ContactSubmission $contact)
    {
        $contact->delete();
        return back()->with('success', 'Solicitud eliminada.');
    }
}
