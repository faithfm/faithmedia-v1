<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'path' => 'nullable|string',
            'prefilter' => 'nullable|string|exists:prefilters,slug',
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|in:asc,desc',
            'layout' => 'nullable|in:details,playlist',
            'cursor' => 'nullable|string',
            'limit' => 'nullable|integer|min:100|max:500',
        ];
    }
}
