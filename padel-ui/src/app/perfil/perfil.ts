import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service';
import { TorneoService } from '../torneos/torneo.service';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
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
  private readonly confirmDialog = inject(ConfirmDialogService);

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

  formatearFecha(fechaStr: string): string {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(Date.UTC(year, month - 1, day));
    const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const meses = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const diaSemana = dias[fecha.getUTCDay()];
    const diaNum = fecha.getUTCDate();
    const mes = meses[fecha.getUTCMonth()];
    
    return `${diaSemana}, ${diaNum} ${mes}`;
  }

  formatearHora(horaStr: string): string {
    return horaStr.substring(0, 5) + 'h';
  }

  getRangoJugador(partidosMes: number): { titulo: string; icono: string; color: string } {
    if (partidosMes >= 20) return { titulo: 'Legend', icono: 'fa-crown', color: '#FFD700' };
    if (partidosMes >= 12) return { titulo: 'Elite', icono: 'fa-star', color: '#CCFF00' };
    if (partidosMes >= 6) return { titulo: 'Advanced', icono: 'fa-medal', color: '#00D4FF' };
    if (partidosMes >= 3) return { titulo: 'Intermediate', icono: 'fa-bolt', color: '#FF6B35' };
    return { titulo: 'Beginner', icono: 'fa-seedling', color: '#A8E6CF' };
  }

  cancelarReserva(id: number) {
    this.confirmDialog.confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? RULE: Minimum 24h notice.',
      confirmText: 'Cancel Booking',
      cancelText: 'Back',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-calendar-times'
    }).subscribe(result => {
      if (result) {
        this.cancelandoReservaId.set(id);
        this.http.delete(`${this.apiUrl}/reservas/${id}`).subscribe({
          next: () => {
            this.cancelandoReservaId.set(null);
            this.cargarDatos();
            this.notificationService.success('Booking cancelled');
          },
          error: (err) => {
            this.cancelandoReservaId.set(null);
            this.notificationService.error(err.error || 'Could not cancel the booking. Please check the notice period (24h).');
          }
        });
      }
    });
  }

  cancelarInscripcionTorneo(id: number) {
    this.confirmDialog.confirm({
      title: 'Cancel Registration',
      message: 'Are you sure you want to cancel your registration for this tournament?',
      confirmText: 'Cancel Registration',
      cancelText: 'Back',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-trophy'
    }).subscribe(result => {
      if (result) {
        this.torneoService.cancelarInscripcion(id).subscribe({
          next: () => {
            this.cargarDatos();
            this.notificationService.success('Registration cancelled successfully');
          },
          error: (err) => {
            this.notificationService.error(err.error || 'Could not cancel the registration');
          }
        });
      }
    });
  }

  cancelarInscripcionClase(id: number) {
    this.confirmDialog.confirm({
      title: 'Cancel Registration',
      message: 'Cancel your registration for this class?',
      confirmText: 'Cancel Registration',
      cancelText: 'Back',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-graduation-cap'
    }).subscribe(result => {
      if (result) {
        this.http.post(`${this.apiUrl}/clases/${id}/cancelar`, {}, { responseType: 'text' }).subscribe({
          next: () => {
            this.cargarDatos();
            this.notificationService.success('Class registration cancelled');
          },
          error: (err) => {
            this.notificationService.error(err.error || 'Could not cancel the registration');
          }
        });
      }
    });
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
        this.mensajeExito.set('Password updated successfully.');
        this.passwordData.set({ oldPassword: '', newPassword: '' });
        setTimeout(() => this.showPasswordForm.set(false), 2000);
      },
      error: (err) => {
        this.mensajeError.set(err.error || 'Could not change password. Please verify your current password and try again.');
      }
    });
  }

  logout() {
    this.authService.logoutAndRedirect();
  }
}
