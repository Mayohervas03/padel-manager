import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../shared/api.config';
import type { Pedido } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos/mis-pedidos`);
  }

  checkout(): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/pedidos/checkout`, {});
  }
}
