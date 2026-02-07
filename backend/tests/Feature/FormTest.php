<?php

declare(strict_types=1);

use App\Models\Form;
use App\Models\User;

beforeEach(function (): void {
    $this->user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('can list forms for authenticated user', function (): void {
    Form::create([
        'user_id' => $this->user->id,
        'title' => 'My Form',
        'slug' => 'my-form-123456',
        'fields' => [],
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/forms');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'My Form');
});

it('can create a form without fields', function (): void {
    $response = $this->actingAs($this->user)->postJson('/api/forms', [
        'title' => 'New Form',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'New Form')
        ->assertJsonPath('data.fields', [])
        ->assertJsonStructure(['data' => ['id', 'title', 'slug', 'fields', 'status']]);

    $this->assertDatabaseHas('forms', [
        'title' => 'New Form',
        'status' => 'draft',
    ]);
});

it('can create a form with fields', function (): void {
    $fields = [
        ['type' => 'text', 'label' => 'Name', 'name' => 'name', 'required' => true],
        ['type' => 'email', 'label' => 'Email', 'name' => 'email', 'required' => true],
    ];

    $response = $this->actingAs($this->user)->postJson('/api/forms', [
        'title' => 'Contact Form',
        'fields' => $fields,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'Contact Form')
        ->assertJsonCount(2, 'data.fields')
        ->assertJsonPath('data.fields.0.type', 'text')
        ->assertJsonPath('data.fields.1.type', 'email');
});

it('can create a form with select field options', function (): void {
    $fields = [
        [
            'type' => 'select',
            'label' => 'Country',
            'name' => 'country',
            'options' => [
                ['label' => 'USA', 'value' => 'us'],
                ['label' => 'Canada', 'value' => 'ca'],
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->postJson('/api/forms', [
        'title' => 'Survey',
        'fields' => $fields,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.fields.0.type', 'select')
        ->assertJsonCount(2, 'data.fields.0.options');
});

it('can view own form', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'My Form',
        'slug' => 'my-form-123456',
        'fields' => [['type' => 'text', 'label' => 'Name', 'name' => 'name']],
    ]);

    $response = $this->actingAs($this->user)->getJson("/api/forms/{$form->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $form->id)
        ->assertJsonPath('data.title', 'My Form')
        ->assertJsonCount(1, 'data.fields');
});

it('cannot view another users form', function (): void {
    $otherUser = User::create([
        'name' => 'Other User',
        'email' => 'other@example.com',
        'password' => bcrypt('password'),
    ]);

    $form = Form::create([
        'user_id' => $otherUser->id,
        'title' => 'Other Form',
        'slug' => 'other-form-123456',
        'fields' => [],
    ]);

    $response = $this->actingAs($this->user)->getJson("/api/forms/{$form->id}");

    $response->assertStatus(403);
});

it('can update form title', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'My Form',
        'slug' => 'my-form-123456',
        'fields' => [],
    ]);

    $response = $this->actingAs($this->user)->putJson("/api/forms/{$form->id}", [
        'title' => 'Updated Form',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.title', 'Updated Form');
});

it('can update form fields', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'My Form',
        'slug' => 'my-form-123456',
        'fields' => [],
    ]);

    $newFields = [
        ['type' => 'text', 'label' => 'First Name', 'name' => 'first_name'],
        ['type' => 'text', 'label' => 'Last Name', 'name' => 'last_name'],
    ];

    $response = $this->actingAs($this->user)->putJson("/api/forms/{$form->id}", [
        'fields' => $newFields,
    ]);

    $response->assertOk()
        ->assertJsonCount(2, 'data.fields')
        ->assertJsonPath('data.fields.0.label', 'First Name');
});

it('can delete own form', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'My Form',
        'slug' => 'my-form-123456',
        'fields' => [],
    ]);

    $response = $this->actingAs($this->user)->deleteJson("/api/forms/{$form->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('forms', ['id' => $form->id]);
});

it('validates field types', function (): void {
    $response = $this->actingAs($this->user)->postJson('/api/forms', [
        'title' => 'Test Form',
        'fields' => [
            ['type' => 'invalid_type', 'label' => 'Test', 'name' => 'test'],
        ],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['fields.0.type']);
});

it('requires title when creating form', function (): void {
    $response = $this->actingAs($this->user)->postJson('/api/forms', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});
