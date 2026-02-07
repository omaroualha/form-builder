<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Form extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'fields',
        'status',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
