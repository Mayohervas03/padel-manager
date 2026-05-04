import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../shared/api.config';
import type { Torneo, InscripcionTorneo, InscripcionTorneoRequest } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getTorneos(): Observable<Torneo[]> {
    return this.http.get<Torneo[]>(`${this.apiUrl}/torneos`);
  }

  getTorneosActivos(): Observable<Torneo[]> {
    return this.http.get<Torneo[]>(`${this.apiUrl}/torneos/activos`);
  }

  createTorneo(torneo: Omit<Torneo, 'id'>): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.apiUrl}/torneos`, torneo);
  }

  updateTorneo(id: number, torneo: Omit<Torneo, 'id'>): Observable<Torneo> {
    return this.http.put<Torneo>(`${this.apiUrl}/torneos/${id}`, torneo);
  }

  deleteTorneo(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/torneos/${id}`);
  }

  getInscripciones(torneoId: number): Observable<InscripcionTorneo[]> {
    return this.http.get<InscripcionTorneo[]>(`${this.apiUrl}/torneos/${torneoId}/inscripciones`);
  }

  inscribirse(torneoId: number, data: InscripcionTorneoRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/torneos/${torneoId}/inscribirse`, data, { responseType: 'text' });
  }

  marcarPagado(inscripcionId: number, pagado: boolean): Observable<InscripcionTorneo> {
    return this.http.put<InscripcionTorneo>(`${this.apiUrl}/torneos/inscripciones/${inscripcionId}/pagado?pagado=${pagado}`, {});
  }

  // --- ADMIN ---
  getTorneoByIdAdmin(id: number): Observable<Torneo> {
    return this.http.get<Torneo>(`${this.apiUrl}/admin/torneos/${id}`);
  }

  getInscripcionesAdmin(torneoId: number): Observable<InscripcionTorneo[]> {
    return this.http.get<InscripcionTorneo[]>(`${this.apiUrl}/admin/torneos/${torneoId}/inscripciones`);
  }

  patchPagoAdmin(inscripcionId: number, pagado: boolean): Observable<InscripcionTorneo> {
    return this.http.patch<InscripcionTorneo>(`${this.apiUrl}/admin/inscripciones/${inscripcionId}/pago?pagado=${pagado}`, {});
  }
}
