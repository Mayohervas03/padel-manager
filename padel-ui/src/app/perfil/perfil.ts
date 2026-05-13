import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service';
import { TorneoService } from '../torneos/torneo.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../shared/api.config';
import type { PerfilDTO, Reserva, Clase, PasswordChangeRequest, InscripcionTorneoPerfil } from '../shared/models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);
  private readonly torneoService = inject(TorneoService);

  readonly perfil = signal<PerfilDTO | null>(null);
  readonly reservas = signal<Reserva[]>([]);
  readonly reservasHistorial = signal<Reserva[]>([]);
  readonly clases = signal<Clase[]>([]);
  readonly clasesHistorial = signal<Clase[]>([]);
  readonly inscripcionesTorneo = signal<InscripcionTorneoPerfil[]>([]);

  readonly showPasswordForm = signal(false);
  readonly passwordData = signal<PasswordChangeRequest>({ oldPassword: '', newPassword: '' });
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');
  readonly isLoading = signal(true);
  readonly hayError = signal(false);
  readonly tabReservasActiva = signal<'activas' | 'historial'>('activas');
  readonly tabClasesActiva = signal<'activas' | 'historial'>('activas');
  readonly cancelandoReservaId = signal<number | null>(null);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    this.hayError.set(false);

    const perfil$ = this.authService.getPerfil().pipe(catchError(() => of(null)));
    const reservas$ = this.http.get<Reserva[]>(`${this.apiUrl}/reservas`).pipe(catchError(() => of(null)));
    const reservasHistorial$ = this.http.get<Reserva[]>(`${this.apiUrl}/reservas?historial=true`).pipe(catchError(() => of(null)));
    const clases$ = this.http.get<Clase[]>(`${this.apiUrl}/clases/mis-clases`).pipe(catchError(() => of(null)));
    const clasesHistorial$ = this.http.get<Clase[]>(`${this.apiUrl}/clases/mis-clases/historial`).pipe(catchError(() => of(null)));
    const torneos$ = this.torneoService.getMisInscripciones().pipe(catchError(() => of(null)));

    forkJoin([perfil$, reservas$, reservasHistorial$, clases$, clasesHistorial$, torneos$]).subscribe({
      next: ([perfilData, reservasData, reservasHistorialData, clasesData, clasesHistorialData, torneosData]) => {
        if (perfilData === null || reservasData === null || clasesData === null || torneosData === null) {
          this.hayError.set(true);
        } else {
          this.perfil.set(perfilData);
          this.reservas.set(reservasData);
          this.reservasHistorial.set(reservasHistorialData || []);
          this.clases.set(clasesData);
          this.clasesHistorial.set(clasesHistorialData || []);
          this.inscripcionesTorneo.set(torneosData);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.hayError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Formatea una fecha ISO a formato legible en español
   * Ej: "2026-05-01" -> "Jue, 1 Mayo"
   */
  formatearFecha(fechaStr: string): string {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(Date.UTC(year, month - 1, day));
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const diaSemana = dias[fecha.getUTCDay()];
    const diaNum = fecha.getUTCDate();
    const mes = meses[fecha.getUTCMonth()];
    
    return `${diaSemana}, ${diaNum} ${mes}`;
  }

  /**
   * Formatea una hora de formato "HH:MM:SS" a "HH:MMh"
   */
  formatearHora(horaStr: string): string {
    return horaStr.substring(0, 5) + 'h';
  }

  /**
   * Determina el nivel/rango del jugador basado en partidos del mes
   */
  getRangoJugador(partidosMes: number): { titulo: string; icono: string; color: string } {
    if (partidosMes >= 20) return { titulo: 'Leyenda', icono: 'fa-crown', color: '#FFD700' };
    if (partidosMes >= 12) return { titulo: 'Elite', icono: 'fa-star', color: '#CCFF00' };
    if (partidosMes >= 6) return { titulo: 'Avanzado', icono: 'fa-medal', color: '#00D4FF' };
    if (partidosMes >= 3) return { titulo: 'Intermedio', icono: 'fa-bolt', color: '#FF6B35' };
    return { titulo: 'Principiante', icono: 'fa-seedling', color: '#A8E6CF' };
  }

  cancelarReserva(id: number) {
    if (confirm('¿Estas seguro de que deseas cancelar esta reserva? REGLA: Minimo 24h de antelacion.')) {
      this.cancelandoReservaId.set(id);
      this.http.delete(`${this.apiUrl}/reservas/${id}`).subscribe({
        next: () => {
          this.cancelandoReservaId.set(null);
          this.cargarDatos();
          this.notificationService.success('Reserva cancelada');
        },
        error: (err) => {
          this.cancelandoReservaId.set(null);
          this.notificationService.error(err.error || 'No se pudo cancelar la reserva. Verifica la antelacion (24h).');
        }
      });
    }
  }

  cancelarInscripcionTorneo(id: number) {
    if (confirm('¿Estas seguro de que deseas cancelar tu inscripcion a este torneo?')) {
      this.torneoService.cancelarInscripcion(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Inscripcion cancelada correctamente');
        },
        error: (err) => {
          this.notificationService.error(err.error || 'No se pudo cancelar la inscripcion');
        }
      });
    }
  }

  cancelarInscripcionClase(id: number) {
    if (confirm('¿Cancelar tu inscripcion a esta clase?')) {
      this.http.post(`${this.apiUrl}/clases/${id}/cancelar`, {}, { responseType: 'text' }).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Inscripcion a clase cancelada');
        },
        error: (err) => {
          this.notificationService.error(err.error || 'No se pudo cancelar la inscripcion');
        }
      });
    }
  }

  togglePasswordForm() {
    this.showPasswordForm.update(v => !v);
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cambiarPassword() {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.authService.cambiarPassword(this.passwordData()).subscribe({
      next: () => {
        this.mensajeExito.set('Contraseña actualizada correctamente.');
        this.passwordData.set({ oldPassword: '', newPassword: '' });
        setTimeout(() => this.showPasswordForm.set(false), 2000);
      },
      error: (err) => {
        this.mensajeError.set(err.error || 'Error al cambiar contraseña');
      }
    });
  }

  logout() {
    this.authService.logoutAndRedirect();
  }
}
