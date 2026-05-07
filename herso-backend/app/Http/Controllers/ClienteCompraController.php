<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClienteCompraController extends Controller
{
    private function clasificacion(float $montoTotal): string
    {
        if ($montoTotal >= 50000) return 'Gold';
        if ($montoTotal >= 5000)  return 'Silver';
        return 'Bronze';
    }

    public function index(Request $request)
    {
        $query = DB::table('vw_ClientesCompras');

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('UltimaCompra', [
                $request->fecha_inicio,
                $request->fecha_fin,
            ]);
        }

        if ($request->filled('monto_minimo')) {
            $query->where('MontoTotal', '>=', $request->monto_minimo);
        }

        if ($request->filled('nombre')) {
            $query->where('NombreCliente', 'like', '%' . $request->nombre . '%');
        }

        $perPage = min((int) $request->get('per_page', 10), 50);
        $result  = $query->paginate($perPage);

        $result->through(function ($cliente) {
            $cliente->Clasificacion = $this->clasificacion($cliente->MontoTotal);
            return $cliente;
        });

        return response()->json($result);
    }

    public function show(int $id)
    {
        $cliente = DB::table('vw_ClientesCompras')
            ->where('CustomerID', $id)
            ->first();

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $cliente->Clasificacion = $this->clasificacion($cliente->MontoTotal);

        return response()->json($cliente);
    }
}
