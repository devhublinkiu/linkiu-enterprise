<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización fina (Policy) se aplica en el controlador.
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'subject' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subject.required' => 'Escribe un asunto para el mensaje.',
            'body.required' => 'Escribe el mensaje.',
            'attachments.*.mimes' => 'Solo se permiten PDF, imágenes y documentos de Office.',
            'attachments.*.max' => 'Cada archivo puede pesar máximo 10 MB.',
        ];
    }
}
