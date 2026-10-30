<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'associate_ids' => ['required', 'array', 'min:1'],
            'associate_ids.*' => ['integer', 'exists:associates,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Ponle un nombre al grupo.',
            'associate_ids.required' => 'Selecciona al menos un asociado.',
            'associate_ids.min' => 'Selecciona al menos un asociado.',
        ];
    }
}
