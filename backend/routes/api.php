<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function (): void {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Forms
    Route::get('/forms', [FormController::class, 'index']);
    Route::post('/forms', [FormController::class, 'store']);
    Route::get('/forms/{form}', [FormController::class, 'show']);
    Route::put('/forms/{form}', [FormController::class, 'update']);
    Route::delete('/forms/{form}', [FormController::class, 'destroy']);
});
