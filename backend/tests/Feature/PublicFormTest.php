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

it('can view published form by slug without auth', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'Public Form',
        'slug' => 'public-form-123456',
        'fields' => [['type' => 'text', 'label' => 'Name', 'name' => 'name']],
        'status' => 'published',
    ]);

    $response = $this->getJson('/api/public/forms/public-form-123456');

    $response->assertOk()
        ->assertJsonPath('data.title', 'Public Form')
        ->assertJsonCount(1, 'data.fields');
});

it('returns 404 for draft form', function (): void {
    Form::create([
        'user_id' => $this->user->id,
        'title' => 'Draft Form',
        'slug' => 'draft-form-123456',
        'fields' => [],
        'status' => 'draft',
    ]);

    $response = $this->getJson('/api/public/forms/draft-form-123456');

    $response->assertStatus(404);
});

it('returns 404 for non-existent slug', function (): void {
    $response = $this->getJson('/api/public/forms/non-existent-slug');

    $response->assertStatus(404);
});

it('can submit form response without auth', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'Contact Form',
        'slug' => 'contact-form-123456',
        'fields' => [
            ['type' => 'text', 'label' => 'Name', 'name' => 'name', 'required' => true],
            ['type' => 'email', 'label' => 'Email', 'name' => 'email', 'required' => true],
        ],
        'status' => 'published',
    ]);

    $response = $this->postJson('/api/public/forms/contact-form-123456/submit', [
        'data' => [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ],
    ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('submissions', [
        'form_id' => $form->id,
    ]);

    // Verify the data was stored correctly
    $submission = $form->submissions()->first();
    expect($submission->data['name'])->toBe('John Doe');
    expect($submission->data['email'])->toBe('john@example.com');
});

it('cannot submit to draft form', function (): void {
    Form::create([
        'user_id' => $this->user->id,
        'title' => 'Draft Form',
        'slug' => 'draft-form-123456',
        'fields' => [],
        'status' => 'draft',
    ]);

    $response = $this->postJson('/api/public/forms/draft-form-123456/submit', [
        'data' => ['name' => 'Test'],
    ]);

    $response->assertStatus(404);
});

it('requires data when submitting form', function (): void {
    Form::create([
        'user_id' => $this->user->id,
        'title' => 'Contact Form',
        'slug' => 'contact-form-123456',
        'fields' => [],
        'status' => 'published',
    ]);

    $response = $this->postJson('/api/public/forms/contact-form-123456/submit', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['data']);
});

it('owner can view form submissions', function (): void {
    $form = Form::create([
        'user_id' => $this->user->id,
        'title' => 'Contact Form',
        'slug' => 'contact-form-123456',
        'fields' => [],
        'status' => 'published',
    ]);

    // Create some submissions
    $form->submissions()->create(['data' => ['name' => 'John']]);
    $form->submissions()->create(['data' => ['name' => 'Jane']]);

    $response = $this->actingAs($this->user)->getJson("/api/forms/{$form->id}/submissions");

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

it('cannot view submissions for another users form', function (): void {
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

    $response = $this->actingAs($this->user)->getJson("/api/forms/{$form->id}/submissions");

    $response->assertStatus(403);
});
