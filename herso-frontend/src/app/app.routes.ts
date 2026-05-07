import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  {
    path: 'clientes',
    loadComponent: () => import('./clientes-list/clientes-list').then(m => m.ClientesListComponent),
  },
  {
    path: 'clientes/:id',
    loadComponent: () => import('./cliente-detalle/cliente-detalle').then(m => m.ClienteDetalleComponent),
  },
];
