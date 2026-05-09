import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../shared/api.config';
import type { CarritoItem } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  private readonly _carritoCount = new BehaviorSubject<number>(0);
  readonly carritoCount$ = this._carritoCount.asObservable();

  getCarrito(): Observable<CarritoItem[]> {
    return this.http.get<CarritoItem[]>(`${this.apiUrl}/carrito`);
  }

  agregarAlCarrito(productoId: number, cantidad: number): Observable<CarritoItem> {
    return this.http.post<CarritoItem>(`${this.apiUrl}/carrito`, { productoId, cantidad })
      .pipe(tap(() => this.actualizarContador()));
  }

  actualizarCantidad(itemId: number, cantidad: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/carrito/${itemId}?cantidad=${cantidad}`, {})
      .pipe(tap(() => this.actualizarContador()));
  }

  eliminarItem(itemId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/carrito/${itemId}`)
      .pipe(tap(() => this.actualizarContador()));
  }

  vaciarCarrito(): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/carrito`)
      .pipe(tap(() => this._carritoCount.next(0)));
  }

  actualizarContador(): void {
    this.getCarrito().subscribe(items => {
      const count = items.reduce((sum, item) => sum + item.cantidad, 0);
      this._carritoCount.next(count);
    });
  }
}
