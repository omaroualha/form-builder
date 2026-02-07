<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreFormRequest;
use App\Http\Requests\UpdateFormRequest;
use App\Http\Resources\FormResource;
use App\Models\Form;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class FormController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $forms = $request->user()->forms()->latest()->get();

        return FormResource::collection($forms);
    }

    public function store(StoreFormRequest $request): JsonResponse
    {
        $form = $request->user()->forms()->create([
            'title' => $request->validated('title'),
            'slug' => Str::slug($request->validated('title')).'-'.Str::random(6),
            'fields' => $request->validated('fields', []),
        ]);

        return (new FormResource($form))->response()->setStatusCode(201);
    }

    public function show(Form $form): FormResource
    {
        $this->authorize('view', $form);

        return new FormResource($form);
    }

    public function update(UpdateFormRequest $request, Form $form): FormResource
    {
        $this->authorize('update', $form);

        $form->update($request->validated());

        return new FormResource($form);
    }

    public function destroy(Form $form): JsonResponse
    {
        $this->authorize('delete', $form);

        $form->delete();

        return response()->json(null, 204);
    }
}
