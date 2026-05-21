import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../shared/api.config';
import { NotificationService } from '../shared/notification.service';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import type { Clase } from '../shared/models';

@Component({
  selector: 'app-user-clases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-clases.html',
  styleUrls: ['./user-clases.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserClasesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly clasesDisponibles = signal<Clase[]>([]);
  readonly misClasesIds = signal<Set<number>>(new Set());
  readonly inscripcionesEnCurso = signal<Set<number>>(new Set());
  readonly isLoading = signal(true);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    this.http.get<Clase[]>(`${this.apiUrl}/clases/disponibles`).subscribe({
      next: (data) => {
        this.clasesDisponibles.set(data);
        this.cargarMisClases();
      },
      error: (err) => {
        console.error('Error loading academy classes', err);
        this.notificationService.error('Could not load classes. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private cargarMisClases() {
    this.http.get<Clase[]>(`${this.apiUrl}/clases/mis-clases`).subscribe({
      next: (misClases) => {
        const ids = new Set(misClases.map(c => c.id));
        this.misClasesIds.set(ids);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  isInscrito(clase: Clase): boolean {
    return this.misClasesIds().has(clase.id);
  }

  inscribirse(clase: Clase) {
    this.inscripcionesEnCurso.update(set => {
      const newSet = new Set(set);
      newSet.add(clase.id);
      return newSet;
    });
    
    this.http.post(`${this.apiUrl}/clases/${clase.id}/inscribir`, {}, { responseType: 'text' }).subscribe({
      next: () => {
        this.inscripcionesEnCurso.update(set => {
          const newSet = new Set(set);
          newSet.delete(clase.id);
          return newSet;
        });
        this.misClasesIds.update(set => {
          const newSet = new Set(set);
          newSet.add(clase.id);
          return newSet;
        });
        this.cargarDatos();
        this.notificationService.success('Registration completed');
      },
      error: (err) => {
        this.inscripcionesEnCurso.update(set => {
          const newSet = new Set(set);
          newSet.delete(clase.id);
          return newSet;
        });
                this.notificationService.error('Could not complete registration: ' + (err.error || err.message));
      }
    });
  }

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dias[fecha.getDay()]}, ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  }

  formatearHora(horaStr: string): string {
    return horaStr.substring(0, 5);
  }

  plazasRestantes(clase: Clase): number {
    return clase.maxAlumnos - (clase.alumnos?.length || 0);
  }

  cancelarInscripcion(clase: Clase) {
    this.confirmDialog.confirm({
      title: 'Cancel Registration',
      message: 'Cancel your registration for this class?',
      confirmText: 'Cancel Registration',
      cancelText: 'Back',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-graduation-cap'
    }).subscribe(result => {
      if (!result) return;

      this.inscripcionesEnCurso.update(set => {
        const newSet = new Set(set);
        newSet.add(clase.id);
        return newSet;
      });

      this.http.post(`${this.apiUrl}/clases/${clase.id}/cancelar`, {}, { responseType: 'text' }).subscribe({
        next: () => {
          this.inscripcionesEnCurso.update(set => {
            const newSet = new Set(set);
            newSet.delete(clase.id);
            return newSet;
          });
          this.misClasesIds.update(set => {
            const newSet = new Set(set);
            newSet.delete(clase.id);
            return newSet;
          });
          this.cargarDatos();
          this.notificationService.success('Registration cancelled');
        },
        error: (err) => {
          this.inscripcionesEnCurso.update(set => {
            const newSet = new Set(set);
            newSet.delete(clase.id);
            return newSet;
          });
          this.notificationService.error('Error: ' + (err.error || err.message));
        }
      });
    });
  }
}
