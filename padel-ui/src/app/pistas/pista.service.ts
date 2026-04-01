import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PistaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pistas';

  getPistas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPista(pista: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pista);
  }

  updatePista(id: number, pista: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, pista);
  }

  deletePista(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
