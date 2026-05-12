import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../services/api.service';
import { PokemonService, PokemonInfo } from '../services/pokemon.service';
import { PokemonPickerComponent } from '../pokemon-picker/pokemon-picker';
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
    MatProgressSpinnerModule, MatIconModule, MatTooltipModule,
  ],
  templateUrl: './seguimiento-form.html',
  styleUrl: './seguimiento-form.scss',
})
export class SeguimientoFormComponent {
  form: FormGroup;
  guardando = false;
  esEdicion: boolean;
  estatusOpciones = ['Activo', 'Inactivo', 'Pendiente', 'VIP', 'En seguimiento'];

  private readonly ALIAS_REGEX = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ\d\s.,'\-]/g;
  private readonly OBS_REGEX   = /[^\x20-\x7EáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙâêîôûäëïöü]/g;

  pokemon: PokemonInfo | null = null;
  cargandoPokemon = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private pokemonSvc: PokemonService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<SeguimientoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SeguimientoDialogData,
  ) {
    this.esEdicion = !!data.seguimiento;
    this.form = this.fb.group({
      Alias:         [data.seguimiento?.Alias ?? '', [Validators.required, Validators.maxLength(25)]],
      Estatus:       [data.seguimiento?.Estatus ?? 'Activo', Validators.required],
      Observaciones: [data.seguimiento?.Observaciones ?? '', [Validators.required, Validators.maxLength(120)]],
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

  filtrarAlias(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(this.ALIAS_REGEX, '');
    if (limpio !== input.value) {
      input.value = limpio;
      this.form.get('Alias')!.setValue(limpio, { emitEvent: false });
    }
  }

  filtrarObs(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(this.OBS_REGEX, '');
    if (limpio !== input.value) {
      input.value = limpio;
      this.form.get('Observaciones')!.setValue(limpio, { emitEvent: false });
    }
  }

  elegirPokemon(): void {
    const ref = this.dialog.open(PokemonPickerComponent, {
      width: '580px',
      maxHeight: '85vh',
      data: { tier: this.data.clasificacion, pokemonIdActual: this.pokemon?.id ?? null },
    });
    ref.afterClosed().subscribe((p: { id: number; nombre: string } | null) => {
      if (!p) return;
      this.pokemon = { id: p.id, nombre: p.nombre, sprite: this.pokemonSvc.spriteUrl(p.id), tipos: [] };
      this.form.patchValue({ PokemonId: p.id, PokemonNombre: p.nombre });
    });
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
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
