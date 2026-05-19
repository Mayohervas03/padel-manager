import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../shared/api.config';
import { NotificationService } from '../../shared/notification.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import type { Pista } from '../../shared/models';

@Component({
  selector: 'app-admin-pistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pistas.html',
  styleUrl: './admin-pistas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPistasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly pistas = signal<Pista[]>([]);
  readonly mostrarFormulario = signal(false);
  readonly isLoading = signal(true);

  pistaEditando: Partial<Pista> = this.resetPista();

  ngOnInit() {
    this.cargarPistas();
  }

  cargarPistas() {
    this.isLoading.set(true);
    this.http.get<Pista[]>(`${this.apiUrl}/admin/pistas`).subscribe({
      next: (data) => {
        this.pistas.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetPista(): Partial<Pista> {
    return {
      nombre: '',
      tipo: 'Cristal',
      ubicacion: 'Indoor',
      precio: 10,
      activo: true
    };
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
    this.pistaEditando = this.resetPista();
  }

  editarPista(pista: Pista) {
    this.pistaEditando = { ...pista };
    this.mostrarFormulario.set(true);
  }

  guardarPista() {
    const p = this.pistaEditando;
    if (!p.nombre) {
      this.notificationService.error('El nombre es obligatorio');
      return;
    }

    const payload = {
      nombre: p.nombre,
      tipo: p.tipo || 'Cristal',
      ubicacion: p.ubicacion || 'Indoor',
      precio: p.precio || 0,
      activo: p.activo ?? true
    };

    if (p.id) {
      this.http.put<Pista>(`${this.apiUrl}/admin/pistas/${p.id}`, payload).subscribe({
        next: () => {
          this.notificationService.success('Pista actualizada');
          this.toggleFormulario();
          this.cargarPistas();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al actualizar')
      });
    } else {
      this.http.post<Pista>(`${this.apiUrl}/admin/pistas`, payload).subscribe({
        next: () => {
          this.notificationService.success('Pista creada');
          this.toggleFormulario();
          this.cargarPistas();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al crear')
      });
    }
  }

  toggleEstado(pista: Pista) {
    const nuevoEstado = !pista.activo;
    const payload = {
      nombre: pista.nombre,
      tipo: pista.tipo,
      ubicacion: pista.ubicacion,
      precio: pista.precio,
      activo: nuevoEstado
    };

    this.http.put<Pista>(`${this.apiUrl}/admin/pistas/${pista.id}`, payload).subscribe({
      next: () => {
        this.notificationService.success(`Pista ${nuevoEstado ? 'activada' : 'desactivada'}`);
        this.cargarPistas();
      },
      error: (err) => this.notificationService.error(err.error || 'Error al cambiar estado')
    });
  }

  borrarPista(id: number) {
    this.confirmDialog.confirm({
      title: 'Borrar Pista',
      message: 'PELIGRO: Borrar la pista eliminará TAMBIÉN todas las reservas asociadas. ¿Deseas continuar?',
      confirmText: 'Borrar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-exclamation-triangle'
    }).subscribe(result => {
      if (result) {
        this.http.delete(`${this.apiUrl}/admin/pistas/${id}`, { responseType: 'text' }).subscribe({
          next: () => {
            this.notificationService.success('Pista eliminada');
            this.cargarPistas();
          },
          error: (err) => this.notificationService.error(err.error || 'Error al eliminar')
        });
      }
    });
  }
}
