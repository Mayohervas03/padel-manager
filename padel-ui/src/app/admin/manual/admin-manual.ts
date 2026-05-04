import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { API_BASE_URL } from '../../shared/api.config';
import type { Usuario, Pista } from '../../shared/models';

@Component({
  selector: 'app-admin-manual',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manual.html',
  styleUrls: ['./admin-manual.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminManualComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly emailBuscado = signal('');
  readonly usuarioEncontrado = signal<Usuario | null>(null);
  readonly mensajeBusqueda = signal('');

  readonly reservaData = signal({
    usuarioId: null as number | null,
    pistaId: null as number | null,
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00'
  });

  readonly pistas = signal<Pista[]>([]);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');

  ngOnInit() {
    this.cargarPistas();
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.buscarUsuarioPorId(Number(userId));
      }
    });
  }

  cargarPistas() {
    this.http.get<Pista[]>(`${this.apiUrl}/pistas`).subscribe(data => {
      this.pistas.set(data);
    });
  }

  buscarUsuario() {
    this.mensajeBusqueda.set('');
    this.usuarioEncontrado.set(null);
    this.reservaData.update(d => ({ ...d, usuarioId: null }));
    this.mensajeExito.set('');
    this.mensajeError.set('');

    if (!this.emailBuscado()) return;

    this.http.get<Usuario>(`${this.apiUrl}/admin/usuarios/search?email=${this.emailBuscado()}`).subscribe({
      next: (user) => {
        this.usuarioEncontrado.set(user);
        this.reservaData.update(d => ({ ...d, usuarioId: user.id }));
        this.mensajeBusqueda.set('Usuario verificado');
      },
      error: () => {
        this.mensajeBusqueda.set('Usuario no encontrado');
      }
    });
  }

  buscarUsuarioPorId(id: number) {
    this.http.get<Usuario>(`${this.apiUrl}/admin/usuarios/${id}`).subscribe({
      next: (user) => {
        this.usuarioEncontrado.set(user);
        this.reservaData.update(d => ({ ...d, usuarioId: user.id }));
        this.mensajeBusqueda.set('Usuario verificado (desde Gestion)');
      },
      error: () => {
        this.mensajeBusqueda.set('Error al cargar usuario');
      }
    });
  }

  crearReserva() {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    const data = this.reservaData();
    if (!data.usuarioId || !data.pistaId || !data.fecha || !data.hora) {
      this.mensajeError.set('Rellena todos los campos');
      return;
    }

    this.http.post(`${this.apiUrl}/admin/reservas/manual`, data).subscribe({
      next: () => {
        this.mensajeExito.set('Reserva forzada con éxito.');
        this.reservaData.update(d => ({ ...d, usuarioId: null, pistaId: null }));
        this.usuarioEncontrado.set(null);
        this.emailBuscado.set('');
        this.mensajeBusqueda.set('');
      },
      error: (err) => {
        // El interceptor normaliza el error
        this.mensajeError.set(err.error || 'Error al crear la reserva');
      }
    });
  }
}
