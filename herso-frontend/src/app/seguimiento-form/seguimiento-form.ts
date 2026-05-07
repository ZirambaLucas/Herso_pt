import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../services/api.service';
import { PokemonService, PokemonInfo } from '../services/pokemon.service';
import { ClienteSeguimiento } from '../models/cliente-seguimiento.model';

export interface SeguimientoDialogData {
  seguimiento?: ClienteSeguimiento;
  customerId: number;
  clasificacion: 'Bronze' | 'Silver' | 'Gold';
}

@Component({
  selector: 'app-seguimiento-form',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './seguimiento-form.html',
  styleUrl: './seguimiento-form.scss',
})
export class SeguimientoFormComponent {
  form: FormGroup;
  guardando = false;
  esEdicion: boolean;
  estatusOpciones = ['Activo', 'Inactivo', 'Pendiente', 'VIP', 'En seguimiento'];

  pokemon: PokemonInfo | null = null;
  cargandoPokemon = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private pokemonSvc: PokemonService,
    public dialogRef: MatDialogRef<SeguimientoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SeguimientoDialogData,
  ) {
    this.esEdicion = !!data.seguimiento;
    this.form = this.fb.group({
      Alias:         [data.seguimiento?.Alias ?? '', Validators.maxLength(100)],
      Estatus:       [data.seguimiento?.Estatus ?? 'Activo', Validators.required],
      Observaciones: [data.seguimiento?.Observaciones ?? ''],
      PokemonId:     [data.seguimiento?.PokemonId ?? null],
      PokemonNombre: [data.seguimiento?.PokemonNombre ?? null],
    });

    if (data.seguimiento?.PokemonId) {
      this.pokemon = {
        id: data.seguimiento.PokemonId,
        nombre: data.seguimiento.PokemonNombre ?? '',
        sprite: this.pokemonSvc.spriteUrl(data.seguimiento.PokemonId),
        tipos: [],
      };
    }
  }

  asignarPokemon(): void {
    this.cargandoPokemon = true;
    const id = this.pokemonSvc.randomIdForTier(this.data.clasificacion);
    this.pokemonSvc.getPokemon(id).subscribe({
      next: (p) => {
        this.pokemon = p;
        this.form.patchValue({ PokemonId: p.id, PokemonNombre: p.nombre });
        this.cargandoPokemon = false;
      },
      error: () => { this.cargandoPokemon = false; },
    });
  }

  quitarPokemon(): void {
    this.pokemon = null;
    this.form.patchValue({ PokemonId: null, PokemonNombre: null });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;
    const payload = { ...this.form.value, CustomerID: this.data.customerId };

    const request$ = this.esEdicion
      ? this.api.updateSeguimiento(this.data.seguimiento!.Id, payload)
      : this.api.createSeguimiento(payload);

    request$.subscribe({
      next: () => { this.guardando = false; this.dialogRef.close(true); },
      error: () => { this.guardando = false; },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
