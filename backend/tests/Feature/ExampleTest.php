<?php

declare(strict_types=1);

it('returns health check', function (): void {
    $this->get('/health')
        ->assertStatus(200)
        ->assertJson(['status' => 'ok']);
});
