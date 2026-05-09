import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../shared/api.config';
import type { Producto, CategoriaProducto } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  getProductosAdmin(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/admin/productos`);
  }

  getProductosPorCategoria(categoria: CategoriaProducto): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/categoria/${categoria}`);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  // Admin
  createProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/admin/productos`, producto);
  }

  updateProducto(id: number, producto: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/admin/productos/${id}`, producto);
  }

  deleteProducto(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/admin/productos/${id}`);
  }
}
