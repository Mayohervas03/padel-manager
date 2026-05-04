import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../shared/api.config';
import type { Pista } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class PistaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getPistas(): Observable<Pista[]> {
    return this.http.get<Pista[]>(`${this.apiUrl}/pistas`);
  }

  createPista(pista: Omit<Pista, 'id'>): Observable<Pista> {
    return this.http.post<Pista>(`${this.apiUrl}/pistas`, pista);
  }

  updatePista(id: number, pista: Omit<Pista, 'id'>): Observable<Pista> {
    return this.http.put<Pista>(`${this.apiUrl}/pistas/${id}`, pista);
  }

  deletePista(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/pistas/${id}`);
  }
}
