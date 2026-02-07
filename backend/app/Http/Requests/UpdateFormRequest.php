<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'fields' => ['sometimes', 'array'],
            'fields.*.type' => ['required_with:fields', 'string', 'in:text,textarea,number,email,select,radio,checkbox,date'],
            'fields.*.label' => ['required_with:fields', 'string', 'max:255'],
            'fields.*.name' => ['required_with:fields', 'string', 'max:255'],
            'fields.*.required' => ['sometimes', 'boolean'],
            'fields.*.placeholder' => ['sometimes', 'string', 'max:255'],
            'fields.*.options' => ['sometimes', 'array'],
            'fields.*.options.*.label' => ['required_with:fields.*.options', 'string'],
            'fields.*.options.*.value' => ['required_with:fields.*.options', 'string'],
        ];
    }
}
