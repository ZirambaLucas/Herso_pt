import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';

export interface FiltrosData {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  montoMin: string;
}

export interface FiltrosResult extends FiltrosData {
  accion: 'aplicar' | 'limpiar';
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function toIso(d: Date | null | undefined): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Component({
  selector: 'app-filtros-bottom-sheet',
  templateUrl: './filtros-bottom-sheet.html',
  styleUrl: './filtros-bottom-sheet.scss',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
  ],
})
export class FiltrosBottomSheet {
  private ref = inject(MatBottomSheetRef<FiltrosBottomSheet>);
  readonly data: FiltrosData = inject(MAT_BOTTOM_SHEET_DATA);

  readonly form = new FormGroup({
    nombre:      new FormControl(this.data.nombre),
    fechaInicio: new FormControl<Date | null>(parseDate(this.data.fechaInicio)),
    fechaFin:    new FormControl<Date | null>(parseDate(this.data.fechaFin)),
    montoMin:    new FormControl(this.data.montoMin),
  });

  aplicar(): void {
    const v = this.form.value;
    this.ref.dismiss({
      accion:      'aplicar',
      nombre:      v.nombre      ?? '',
      fechaInicio: toIso(v.fechaInicio),
      fechaFin:    toIso(v.fechaFin),
      montoMin:    v.montoMin    ?? '',
    } as FiltrosResult);
  }

  limpiar(): void {
    this.ref.dismiss({
      accion: 'limpiar', nombre: '', fechaInicio: '', fechaFin: '', montoMin: '',
    } as FiltrosResult);
  }

  cerrar(): void {
    this.ref.dismiss();
  }

  get hayFiltros(): boolean {
    const v = this.form.value;
    return !!(v.nombre?.trim() || v.fechaInicio || v.fechaFin || v.montoMin?.trim());
  }

  private readonly NOMBRE_REGEX = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ.,'\s]/g;

  filtrarNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(this.NOMBRE_REGEX, '');
    if (limpio !== input.value) {
      input.value = limpio;
      this.form.get('nombre')!.setValue(limpio, { emitEvent: false });
    }
  }

  formatearMonto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    this.form.get('montoMin')!.setValue(
      digits ? Number(digits).toLocaleString('en-US') : '',
      { emitEvent: false },
    );
  }
}
