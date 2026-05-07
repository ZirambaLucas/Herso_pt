<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClienteCompra extends Model
{
    protected $table = 'vw_ClientesCompras';
    protected $primaryKey = 'CustomerID';
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'int';
}
