<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClienteCompraController;
use App\Http\Controllers\ClienteSeguimientoController;

Route::get('/clientes-compras', [ClienteCompraController::class, 'index']);
Route::get('/clientes-compras/{id}', [ClienteCompraController::class, 'show']);

Route::get('/cliente-seguimientos', [ClienteSeguimientoController::class, 'index']);
Route::post('/cliente-seguimientos', [ClienteSeguimientoController::class, 'store']);
Route::put('/cliente-seguimientos/{id}', [ClienteSeguimientoController::class, 'update']);
Route::delete('/cliente-seguimientos/{id}', [ClienteSeguimientoController::class, 'destroy']);
