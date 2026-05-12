import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { DatePipe, CurrencyPipe, DecimalPipe, LowerCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../services/api.service';
import { ClienteCompra } from '../models/cliente-compra.model';
import { FiltrosBottomSheet, FiltrosResult } from '../filtros-bottom-sheet/filtros-bottom-sheet';

interface AdvertenciaData { titulo: string; mensaje: string; }

const STATE_KEY = 'herso_clientes_estado';

@Component({
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p style="margin: 8px 0">{{ data.mensaje }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close>Entendido</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class AdvertenciaDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: AdvertenciaData) {}
}

@Component({
  selector: 'app-clientes-list',
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, DecimalPipe, LowerCasePipe,
    MatTableModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTooltipModule, MatPaginatorModule, MatBottomSheetModule, MatBadgeModule,
  ],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.scss',
})
export class ClientesListComponent implements OnInit, OnDestroy {
  clientes: ClienteCompra[] = [];
  cargando = false;
  columnas = ['NombreCliente', 'Clasificacion', 'UltimaCompra', 'TotalOrdenes', 'MontoTotal', 'MontoPromedio', 'acciones'];

  totalRegistros = 0;
  paginaActual = 1;
  porPagina = 10;

  nombreCtrl      = new FormControl('');
  fechaInicioCtrl = new FormControl('');
  fechaFinCtrl    = new FormControl('');
  montoMinCtrl    = new FormControl('');

  get cantFiltrosActivos(): number {
    return [
      this.nombreCtrl.value?.trim(),
      this.fechaInicioCtrl.value,
      this.fechaFinCtrl.value,
      this.montoMinCtrl.value,
    ].filter(Boolean).length;
  }

  abrirFiltros(): void {
    this.bottomSheet.open(FiltrosBottomSheet, {
      data: {
        nombre:      this.nombreCtrl.value      ?? '',
        fechaInicio: this.fechaInicioCtrl.value ?? '',
        fechaFin:    this.fechaFinCtrl.value    ?? '',
        montoMin:    this.montoMinCtrl.value    ?? '',
      },
    }).afterDismissed().subscribe((result: FiltrosResult | undefined) => {
      if (!result) return;
      if (result.accion === 'limpiar') { this.limpiar(); return; }
      this.nombreCtrl.setValue(result.nombre,      { emitEvent: false });
      this.fechaInicioCtrl.setValue(result.fechaInicio, { emitEvent: false });
      this.fechaFinCtrl.setValue(result.fechaFin,   { emitEvent: false });
      this.montoMinCtrl.setValue(result.montoMin,   { emitEvent: false });
      this.buscarExplicito();
    });
  }

  private get hayFiltros(): boolean {
    return !!(
      this.nombreCtrl.value?.trim() ||
      this.fechaInicioCtrl.value ||
      this.fechaFinCtrl.value ||
      this.montoMinCtrl.value
    );
  }

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
  ) {
    this.nombreCtrl.valueChanges.pipe(
      debounceTime(350),
      takeUntilDestroyed(),
    ).subscribe((val) => {
      const limpio = (val ?? '').replace(this.NOMBRE_REGEX, '');
      if (limpio !== this.ultimaBusqueda) {
        this.ultimaBusqueda = limpio;
        this.buscar(1);
      }
    });
  }

  ngOnInit(): void {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      this.nombreCtrl.setValue(s.nombre, { emitEvent: false });
      this.fechaInicioCtrl.setValue(s.fechaInicio, { emitEvent: false });
      this.fechaFinCtrl.setValue(s.fechaFin, { emitEvent: false });
      this.montoMinCtrl.setValue(s.montoMin, { emitEvent: false });
      this.buscar(s.pagina);
    } else {
      this.buscar();
    }
  }

  ngOnDestroy(): void {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({
      pagina:      this.paginaActual,
      nombre:      this.nombreCtrl.value ?? '',
      fechaInicio: this.fechaInicioCtrl.value ?? '',
      fechaFin:    this.fechaFinCtrl.value ?? '',
      montoMin:    this.montoMinCtrl.value ?? '',
    }));
  }

  private readonly NOMBRE_REGEX = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ.,'\s]/g;
  private ultimaBusqueda = '';

  filtrarNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(this.NOMBRE_REGEX, '');
    if (limpio !== input.value) {
      input.value = limpio;
      this.nombreCtrl.setValue(limpio, { emitEvent: true });
    }
  }

  formatearMonto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const formatted = digits ? Number(digits).toLocaleString('en-US') : '';
    this.montoMinCtrl.setValue(formatted, { emitEvent: false });
  }

  buscarExplicito(): void {
    if (!this.hayFiltros) {
      this.advertir(
        'Sin parámetros de búsqueda',
        'Ingresa al menos un parámetro (nombre, fechas o monto mínimo) para realizar la búsqueda.',
      );
      return;
    }
    const inicio = this.fechaInicioCtrl.value;
    const fin    = this.fechaFinCtrl.value;
    if (inicio && fin && fin < inicio) {
      this.advertir(
        'Rango de fechas inválido',
        'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
      );
      return;
    }
    this.buscar(1);
  }

  buscar(pagina = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    const filters: Record<string, string> = {
      nombre:       this.nombreCtrl.value ?? '',
      fecha_inicio: this.fechaInicioCtrl.value ?? '',
      fecha_fin:    this.fechaFinCtrl.value ?? '',
      monto_minimo: (this.montoMinCtrl.value ?? '').replace(/,/g, ''),
    };
    this.api.getClientesCompras(filters, pagina, this.porPagina).subscribe({
      next: (res) => {
        this.clientes = res.data;
        this.totalRegistros = res.total;
        this.cargando = false;
      },
      error: () => { this.cargando = false; },
    });
  }

  onPageChange(event: PageEvent): void {
    this.porPagina = event.pageSize;
    this.buscar(event.pageIndex + 1);
  }

  limpiar(): void {
    sessionStorage.removeItem(STATE_KEY);
    this.nombreCtrl.reset('');
    this.fechaInicioCtrl.reset('');
    this.fechaFinCtrl.reset('');
    this.montoMinCtrl.reset('');
    this.buscar(1);
  }

  private advertir(titulo: string, mensaje: string): void {
    this.dialog.open(AdvertenciaDialogComponent, { width: '380px', data: { titulo, mensaje } });
  }
}
