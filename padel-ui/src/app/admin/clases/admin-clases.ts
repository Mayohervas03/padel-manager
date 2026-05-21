import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../shared/api.config';
import { NotificationService } from '../../shared/notification.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { ActivityLogService } from '../../shared/activity-log.service';
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
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly activityLog = inject(ActivityLogService);

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
      this.notificationService.error('Please fill in all required fields');
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
          this.notificationService.success('Class updated');
          this.activityLog.log('EDITAR', 'CLASE', `Updated class "${payload.titulo}" (#${c.id})`, c.id);
          this.toggleFormulario();
          this.cargarClases();
        },
        error: (err) => this.notificationService.error(err.error || 'Could not save class changes. Please try again.')
      });
    } else {
      this.http.post<Clase>(`${this.apiUrl}/admin/clases`, payload).subscribe({
        next: (created) => {
          this.notificationService.success('Class created');
          this.activityLog.log('CREAR', 'CLASE', `Created class "${payload.titulo}"`, created.id);
          this.toggleFormulario();
          this.cargarClases();
        },
        error: (err) => this.notificationService.error(err.error || 'Could not create the class. Please check the details and try again.')
      });
    }
  }

  eliminarClase(id: number) {
    this.confirmDialog.confirm({
      title: 'Delete Class',
      message: 'Delete this class? All enrolled students will lose it.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-exclamation-triangle'
    }).subscribe(result => {
      if (result) {
        this.http.delete(`${this.apiUrl}/admin/clases/${id}`).subscribe({
          next: () => {
            this.notificationService.success('Class deleted');
            this.activityLog.log('ELIMINAR', 'CLASE', `Deleted class #${id}`, id);
            this.cargarClases();
          },
          error: (err) => this.notificationService.error(err.error || 'Could not delete the class. Students may still be enrolled.')
        });
      }
    });
  }

  eliminarAlumno(claseId: number, alumnoId: number) {
    this.confirmDialog.confirm({
      title: 'Remove Student',
      message: 'Are you sure you want to remove this student from the class?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-user-minus'
    }).subscribe(result => {
      if (result) {
        this.http.delete(`${this.apiUrl}/admin/clases/${claseId}/alumnos/${alumnoId}`).subscribe({
          next: () => {
            this.notificationService.success('Student removed from class');
            this.activityLog.log('ELIMINAR', 'ALUMNO_CLASE', `Removed student #${alumnoId} from class #${claseId}`, claseId);
            this.cargarClases();
          },
          error: (err) => this.notificationService.error(err.error || 'Could not remove student from class.')
        });
      }
    });
  }
}
