<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\FormResource;
use App\Http\Resources\SubmissionResource;
use App\Models\Form;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicFormController extends Controller
{
    public function show(string $slug): FormResource|JsonResponse
    {
        $form = Form::where('slug', $slug)->first();

        if (! $form || ! $form->isPublished()) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        return new FormResource($form);
    }

    public function submit(Request $request, string $slug): SubmissionResource|JsonResponse
    {
        $form = Form::where('slug', $slug)->first();

        if (! $form || ! $form->isPublished()) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        $validated = $request->validate([
            'data' => ['required', 'array'],
        ]);

        $submission = $form->submissions()->create([
            'data' => $validated['data'],
        ]);

        return (new SubmissionResource($submission))->response()->setStatusCode(201);
    }
}
