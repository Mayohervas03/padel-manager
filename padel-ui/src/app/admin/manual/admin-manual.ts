import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { API_BASE_URL } from '../../shared/api.config';
import { NotificationService } from '../../shared/notification.service';
import type { Usuario, Pista } from '../../shared/models';

@Component({
  selector: 'app-admin-manual',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manual.html',
  styleUrl: './admin-manual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminManualComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);

  private queryParamsSub: Subscription | null = null;
  private timeoutBusqueda: any;

  readonly textoBusqueda = signal('');
  readonly resultadosBusqueda = signal<Usuario[]>([]);
  readonly mostrarDropdown = signal(false);
  readonly usuarioSeleccionado = signal<Usuario | null>(null);
  readonly mensajeError = signal('');

  readonly pistas = signal<Pista[]>([]);
  readonly mensajeExito = signal('');
  readonly isProcessing = signal(false);

  fechaValue = new Date().toISOString().split('T')[0];
  horaValue = '09:00';
  pistaIdValue: number | null = null;

  readonly fechaMinima = new Date().toISOString().split('T')[0];

  private esFechaHoraPasada(): boolean {
    const ahora = new Date();
    const fechaSeleccionada = new Date(this.fechaValue + 'T00:00:00');
    const hoy = new Date(ahora.toISOString().split('T')[0] + 'T00:00:00');

    if (fechaSeleccionada < hoy) {
      return true;
    }

    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const [horaStr, minStr] = this.horaValue.split(':');
      const horaSeleccionada = new Date();
      horaSeleccionada.setHours(parseInt(horaStr, 10), parseInt(minStr, 10), 0, 0);

      if (horaSeleccionada <= ahora) {
        return true;
      }
    }

    return false;
  }

  ngOnInit() {
    this.cargarPistas();
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.cargarUsuarioPorId(Number(userId));
      }
    });
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
    clearTimeout(this.timeoutBusqueda);
  }

  cargarPistas() {
    this.http.get<Pista[]>(`${this.apiUrl}/pistas`).subscribe(data => {
      this.pistas.set(data);
    });
  }

  cargarUsuarioPorId(id: number) {
    this.http.get<Usuario>(`${this.apiUrl}/admin/usuarios/${id}`).subscribe({
      next: (user) => {
        this.seleccionarUsuario(user);
      },
      error: () => {
        this.notificationService.error('Could not load user details. Please try searching again.');
      }
    });
  }

  onBusquedaInput(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.textoBusqueda.set(valor);
    this.mensajeError.set('');

    clearTimeout(this.timeoutBusqueda);

    if (valor.length < 2) {
      this.resultadosBusqueda.set([]);
      this.mostrarDropdown.set(false);
      return;
    }

    this.timeoutBusqueda = setTimeout(() => {
      this.http.get<Usuario[]>(`${this.apiUrl}/admin/usuarios/buscar?q=${encodeURIComponent(valor)}`).subscribe({
        next: (usuarios) => {
          this.resultadosBusqueda.set(usuarios);
          this.mostrarDropdown.set(usuarios.length > 0);
        },
        error: () => {
          this.resultadosBusqueda.set([]);
          this.mostrarDropdown.set(false);
        }
      });
    }, 300);
  }

  seleccionarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado.set(usuario);
    this.textoBusqueda.set(usuario.nombre);
    this.resultadosBusqueda.set([]);
    this.mostrarDropdown.set(false);
  }

  limpiarBusqueda() {
    this.usuarioSeleccionado.set(null);
    this.textoBusqueda.set('');
    this.resultadosBusqueda.set([]);
    this.mostrarDropdown.set(false);
    this.pistaIdValue = null;
  }

  crearReserva() {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    if (!this.usuarioSeleccionado()) {
      this.mensajeError.set('Select a user');
      return;
    }

    const data = {
      usuarioId: this.usuarioSeleccionado()!.id,
      pistaId: this.pistaIdValue,
      fecha: this.fechaValue,
      hora: this.horaValue
    };

    if (!data.pistaId || !data.fecha || !data.hora) {
      this.mensajeError.set('Fill in all fields');
      return;
    }

    if (this.esFechaHoraPasada()) {
      this.mensajeError.set('Bookings cannot be made for dates or times that have already passed');
      return;
    }

    this.isProcessing.set(true);
    this.http.post(`${this.apiUrl}/admin/reservas/manual`, data).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.mensajeExito.set('Booking created successfully');
        this.pistaIdValue = null;
        this.limpiarBusqueda();
        this.notificationService.success('Booking created successfully');
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.mensajeError.set(err.error || 'Could not create the booking. The court may be unavailable.');
        this.notificationService.error(err.error || 'Could not create the booking. The court may be unavailable.');
      }
    });
  }
}
