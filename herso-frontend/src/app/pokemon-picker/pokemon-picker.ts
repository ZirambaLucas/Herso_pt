import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PokemonService } from '../services/pokemon.service';

export interface PokemonPickerData {
  tier: 'Bronze' | 'Silver' | 'Gold';
  pokemonIdActual?: number | null;
}

interface PokemonEntry { id: number; nombre: string; }

@Component({
  selector: 'app-pokemon-picker',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './pokemon-picker.html',
  styleUrl: './pokemon-picker.scss',
})
export class PokemonPickerComponent implements OnInit {
  cargando = true;
  todos: PokemonEntry[] = [];
  filtrados: PokemonEntry[] = [];
  seleccionado: PokemonEntry | null = null;
  busqueda = new FormControl('');

  get tierClass(): string { return this.data.tier.toLowerCase(); }

  constructor(
    private pokemonSvc: PokemonService,
    public dialogRef: MatDialogRef<PokemonPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PokemonPickerData,
  ) {}

  ngOnInit(): void {
    this.pokemonSvc.listForTier(this.data.tier).subscribe({
      next: (lista) => {
        this.todos = lista;
        this.filtrados = lista;
        if (this.data.pokemonIdActual) {
          this.seleccionado = lista.find(p => p.id === this.data.pokemonIdActual) ?? null;
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; },
    });

    this.busqueda.valueChanges.subscribe(v => {
      const q = (v ?? '').toLowerCase().trim();
      this.filtrados = q
        ? this.todos.filter(p => p.nombre.includes(q) || String(p.id).includes(q))
        : [...this.todos];
    });
  }

  seleccionar(p: PokemonEntry): void {
    this.seleccionado = this.seleccionado?.id === p.id ? null : p;
  }

  confirmar(): void { this.dialogRef.close(this.seleccionado); }
  cancelar(): void  { this.dialogRef.close(null); }

  spriteUrl(id: number): string { return this.pokemonSvc.spriteUrl(id); }
}