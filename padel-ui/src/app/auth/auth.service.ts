import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private usuariosUrl = 'http://localhost:8080/api/usuarios';
  private tokenKey = 'padel_token';
  private roleKey = 'padel_role';
  
  private nombreSubject = new BehaviorSubject<string | null>(localStorage.getItem('padel_nombre'));
  nombre$ = this.nombreSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
          if (response.rol) {
            localStorage.setItem(this.roleKey, response.rol);
          }
          if (response.nombre) {
            localStorage.setItem('padel_nombre', response.nombre);
            this.nombreSubject.next(response.nombre);
          }
        }
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem('padel_nombre');
    this.nombreSubject.next(null);
    this.router.navigate(['/login']);
  }

  getPerfil() {
    return this.http.get<any>(`${this.usuariosUrl}/me`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  cambiarPassword(data: any) {
    return this.http.put(`${this.usuariosUrl}/password`, data, { 
      responseType: 'text',
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }
}
