<?php

namespace App\Http\Controllers;

use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicContactController extends Controller
{
    /**
     * Display the contact page.
     */
    public function index()
    {
        return Inertia::render('Public/Contact', [
            'tenant' => [
                'company_name' => 'CAMEP',
            ]
        ]);
    }

    /**
     * Store a new contact submission.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'nit' => 'nullable|string|max:255',
            'full_name' => 'required|string|max:255',
            'id_number' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
            'types' => 'required|array|min:1',
            'service' => 'required|string|max:255',
            'message' => 'required|string',
            'accepted_terms' => 'required|accepted',
        ]);

        $submission = ContactSubmission::create([
            ...$validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'pending',
        ]);

        // Enviar correos
        try {
            \Illuminate\Support\Facades\Mail::to(config('mail.admin_recipient', env('ADMIN_EMAIL', 'afiliate@camepg.org')))
                ->send(new \App\Mail\ContactReceivedToAdmin($submission));
            
            \Illuminate\Support\Facades\Mail::to($submission->email)
                ->send(new \App\Mail\ContactConfirmationToUser($submission));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando correos de contacto: ' . $e->getMessage());
        }

        return back()->with('success', 'Tu solicitud ha sido enviada con éxito. Nos pondremos en contacto contigo pronto.');
    }
}
