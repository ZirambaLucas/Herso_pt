import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteCompra } from '../models/cliente-compra.model';
import { ClienteSeguimiento } from '../models/cliente-seguimiento.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getClientesCompras(filters: Record<string, string> = {}, page = 1, perPage = 10): Observable<PaginatedResponse<ClienteCompra>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<PaginatedResponse<ClienteCompra>>(`${this.base}/clientes-compras`, { params });
  }

  getClienteCompra(id: number): Observable<ClienteCompra> {
    return this.http.get<ClienteCompra>(`${this.base}/clientes-compras/${id}`);
  }

  getSeguimientos(customerId: number): Observable<ClienteSeguimiento[]> {
    const params = new HttpParams().set('customer_id', customerId);
    return this.http.get<ClienteSeguimiento[]>(`${this.base}/cliente-seguimientos`, { params });
  }

  createSeguimiento(data: Partial<ClienteSeguimiento>): Observable<ClienteSeguimiento> {
    return this.http.post<ClienteSeguimiento>(`${this.base}/cliente-seguimientos`, data);
  }

  updateSeguimiento(id: number, data: Partial<ClienteSeguimiento>): Observable<ClienteSeguimiento> {
    return this.http.put<ClienteSeguimiento>(`${this.base}/cliente-seguimientos/${id}`, data);
  }

  deleteSeguimiento(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/cliente-seguimientos/${id}`);
  }
}
