import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../shared/api.config';
import { NotificationService } from '../../shared/notification.service';
import type { Clase, Pista } from '../../shared/models';

@Component({
  selector: 'app-admin-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-clases.html',
  styleUrl: './admin-clases.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminClasesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);

  readonly clases = signal<Clase[]>([]);
  readonly pistas = signal<Pista[]>([]);
  readonly mostrarFormulario = signal(false);
  readonly isLoading = signal(true);

  claseEditando: Partial<Clase> & { pistaId?: number | null } = this.resetClase();

  ngOnInit() {
    this.cargarPistas();
    this.cargarClases();
  }

  cargarPistas() {
    this.http.get<Pista[]>(`${this.apiUrl}/pistas`).subscribe(data => this.pistas.set(data));
  }

  cargarClases() {
    this.isLoading.set(true);
    this.http.get<Clase[]>(`${this.apiUrl}/admin/clases`).subscribe({
      next: (data) => {
        this.clases.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetClase(): Partial<Clase> & { pistaId?: number | null } {
    return {
      titulo: '',
      monitor: '',
      nivel: 'INICIACION',
      precio: 0,
      maxAlumnos: 4,
      fecha: '',
      hora: '',
      pistaId: null
    };
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
    this.claseEditando = this.resetClase();
  }

  editarClase(clase: Clase) {
    this.claseEditando = {
      ...clase,
      pistaId: clase.pista?.id || null
    };
    this.mostrarFormulario.set(true);
  }

  guardarClase() {
    const c = this.claseEditando;
    if (!c.titulo || !c.monitor || !c.fecha || !c.hora || !c.pistaId) {
      this.notificationService.error('Completa todos los campos obligatorios');
      return;
    }

    const payload = {
      titulo: c.titulo,
      monitor: c.monitor,
      nivel: c.nivel,
      precio: c.precio || 0,
      maxAlumnos: c.maxAlumnos || 4,
      fecha: c.fecha,
      hora: c.hora,
      pistaId: c.pistaId
    };

    if (c.id) {
      this.http.put<Clase>(`${this.apiUrl}/admin/clases/${c.id}`, payload).subscribe({
        next: () => {
          this.notificationService.success('Clase actualizada');
          this.toggleFormulario();
          this.cargarClases();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al actualizar')
      });
    } else {
      this.http.post<Clase>(`${this.apiUrl}/admin/clases`, payload).subscribe({
        next: () => {
          this.notificationService.success('Clase creada');
          this.toggleFormulario();
          this.cargarClases();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al crear')
      });
    }
  }

  eliminarClase(id: number) {
    if (confirm('¿Borrar esta clase? Todos los alumnos inscritos la perderán.')) {
      this.http.delete(`${this.apiUrl}/admin/clases/${id}`).subscribe({
        next: () => {
          this.notificationService.success('Clase eliminada');
          this.cargarClases();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al eliminar')
      });
    }
  }
}
