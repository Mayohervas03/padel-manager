import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../shared/api.config';
import type { AuthResponse, LoginRequest, RegisterRequest, PasswordChangeRequest, PerfilDTO } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_BASE_URL);

  private readonly tokenKey = 'padel_token';
  private readonly roleKey = 'padel_role';
  private readonly userIdKey = 'padel_user_id';

  private readonly nombreSubject = new BehaviorSubject<string | null>(localStorage.getItem('padel_nombre'));
  readonly nombre$: Observable<string | null> = this.nombreSubject.asObservable();

  register(userData: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/auth/register`, userData, { responseType: 'text' });
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response?.token) {
          this.setToken(response.token);
          if (response.rol) {
            localStorage.setItem(this.roleKey, response.rol);
          }
          if (response.nombre) {
            localStorage.setItem('padel_nombre', response.nombre);
            this.nombreSubject.next(response.nombre);
          }
          if (response.userId) {
            localStorage.setItem(this.userIdKey, response.userId.toString());
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

  /**
   * Decodifica el payload de un token JWT y devuelve el objeto.
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  /**
   * Verifica si el token actual ha expirado.
   * Devuelve true si el token existe y NO ha expirado.
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    // exp está en segundos, Date.now() en milisegundos
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }

  isLoggedIn(): boolean {
    return this.isTokenValid();
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  getCurrentUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? Number(id) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('padel_nombre');
    this.nombreSubject.next(null);
  }

  /**
   * Cierra sesión y redirige al login con un mensaje opcional.
   */
  logoutAndRedirect(message?: string): void {
    this.logout();
    const queryParams = message ? { message } : undefined;
    this.router.navigate(['/login'], { queryParams });
  }

  getPerfil(): Observable<PerfilDTO> {
    return this.http.get<PerfilDTO>(`${this.apiUrl}/usuarios/me`);
  }

  cambiarPassword(data: PasswordChangeRequest) {
    return this.http.put(`${this.apiUrl}/usuarios/password`, data, { responseType: 'text' });
  }
}
