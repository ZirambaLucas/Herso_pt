<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_seguimientos', function (Blueprint $table) {
            $table->id('Id');
            $table->integer('CustomerID');
            $table->string('Alias', 100)->nullable();
            $table->string('Estatus', 50)->default('Activo');
            $table->text('Observaciones')->nullable();
            $table->integer('PokemonId')->nullable();
            $table->string('PokemonNombre', 100)->nullable();
            $table->boolean('IsDeleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_seguimientos');
    }
};
