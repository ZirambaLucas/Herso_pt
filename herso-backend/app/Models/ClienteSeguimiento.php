<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClienteSeguimiento extends Model
{
    protected $table = 'cliente_seguimientos';
    protected $primaryKey = 'Id';

    protected $fillable = [
        'CustomerID',
        'Alias',
        'Estatus',
        'Observaciones',
        'PokemonId',
        'PokemonNombre',
        'IsDeleted',
    ];

    protected $casts = [
        'IsDeleted' => 'boolean',
    ];

    public function scopeActivos($query)
    {
        return $query->where('IsDeleted', false);
    }
}
