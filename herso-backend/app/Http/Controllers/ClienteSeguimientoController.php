<?php

namespace App\Http\Controllers;

use App\Models\ClienteSeguimiento;
use Illuminate\Http\Request;

class ClienteSeguimientoController extends Controller
{
    public function index(Request $request)
    {
        $query = ClienteSeguimiento::activos();

        if ($request->filled('customer_id')) {
            $query->where('CustomerID', $request->customer_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'CustomerID'    => 'required|integer',
            'Alias'         => 'nullable|string|max:100',
            'Estatus'       => 'nullable|string|max:50',
            'Observaciones' => 'nullable|string',
            'PokemonId'     => 'nullable|integer',
            'PokemonNombre' => 'nullable|string|max:100',
        ]);

        $seguimiento = ClienteSeguimiento::create($validated);

        return response()->json($seguimiento, 201);
    }

    public function update(Request $request, $id)
    {
        $seguimiento = ClienteSeguimiento::activos()->find($id);

        if (!$seguimiento) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }

        $validated = $request->validate([
            'Alias'         => 'nullable|string|max:100',
            'Estatus'       => 'nullable|string|max:50',
            'Observaciones' => 'nullable|string',
            'PokemonId'     => 'nullable|integer',
            'PokemonNombre' => 'nullable|string|max:100',
        ]);

        $seguimiento->update($validated);

        return response()->json($seguimiento);
    }

    public function destroy($id)
    {
        $seguimiento = ClienteSeguimiento::activos()->find($id);

        if (!$seguimiento) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }

        $seguimiento->update(['IsDeleted' => true]);

        return response()->json(['message' => 'Registro eliminado correctamente']);
    }
}
