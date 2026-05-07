import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe, LowerCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ApiService } from '../services/api.service';
import { PokemonService } from '../services/pokemon.service';
import { ClienteCompra } from '../models/cliente-compra.model';
import { ClienteSeguimiento } from '../models/cliente-seguimiento.model';
import { SeguimientoFormComponent } from '../seguimiento-form/seguimiento-form';

@Component({
  selector: 'app-cliente-detalle',
  imports: [
    DatePipe, CurrencyPipe, LowerCasePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './cliente-detalle.html',
  styleUrl: './cliente-detalle.scss',
})
export class ClienteDetalleComponent implements OnInit {
  cliente: ClienteCompra | null = null;
  seguimientos: ClienteSeguimiento[] = [];
  cargando = true;
  columnasSeguimientos = ['Alias', 'Estatus', 'Pokemon', 'Observaciones', 'acciones'];

  pokemonId = 0;
  pokemonNombre = '';
  pokemonTipos: string[] = [];
  pokemonCargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public pokemonSvc: PokemonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos(id);
  }

  cargarDatos(id: number): void {
    this.cargando = true;
    forkJoin({
      cliente: this.api.getClienteCompra(id),
      seguimientos: this.api.getSeguimientos(id),
    }).subscribe({
      next: ({ cliente, seguimientos }) => {
        this.cliente = cliente;
        this.seguimientos = seguimientos;
        this.cargando = false;
        this.cargarPokemonCliente();
      },
      error: () => { this.cargando = false; },
    });
  }

  cargarPokemonCliente(): void {
    if (!this.cliente) return;
    this.pokemonCargando = true;
    const id = this.pokemonSvc.idForClient(this.cliente.CustomerID, this.cliente.Clasificacion);
    this.pokemonSvc.getPokemon(id).subscribe({
      next: p => {
        this.pokemonId = p.id;
        this.pokemonNombre = p.nombre;
        this.pokemonTipos = p.tipos;
        this.pokemonCargando = false;
      },
      error: () => {
        this.pokemonId = id;
        this.pokemonNombre = '';
        this.pokemonTipos = [];
        this.pokemonCargando = false;
      },
    });
  }

  abrirFormulario(seguimiento?: ClienteSeguimiento): void {
    const ref = this.dialog.open(SeguimientoFormComponent, {
      width: '520px',
      data: {
        seguimiento,
        customerId: this.cliente!.CustomerID,
        clasificacion: this.cliente!.Clasificacion,
      },
    });
    ref.afterClosed().subscribe(guardado => {
      if (guardado) {
        this.snackBar.open(
          seguimiento ? 'Seguimiento actualizado' : 'Seguimiento creado',
          'OK', { duration: 3000 }
        );
        this.cargarDatos(this.cliente!.CustomerID);
      }
    });
  }

  eliminar(seg: ClienteSeguimiento): void {
    if (!confirm('¿Eliminar este seguimiento?')) return;
    this.api.deleteSeguimiento(seg.Id).subscribe({
      next: () => {
        this.snackBar.open('Seguimiento eliminado', 'OK', { duration: 3000 });
        this.cargarDatos(this.cliente!.CustomerID);
      },
      error: () => {
        this.snackBar.open('Error al eliminar', 'OK', { duration: 3000 });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}
