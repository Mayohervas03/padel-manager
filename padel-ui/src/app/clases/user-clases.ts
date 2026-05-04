import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../shared/api.config';
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

  readonly clasesDisponibles = signal<Clase[]>([]);
  readonly inscripcionesEnCurso = signal<Set<number>>(new Set());
  readonly isLoading = signal(true);

  ngOnInit() {
    this.cargarClases();
  }

  cargarClases() {
    this.isLoading.set(true);
    this.http.get<Clase[]>(`${this.apiUrl}/clases/disponibles`).subscribe({
      next: (data) => {
        this.clasesDisponibles.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando academia', err);
        this.isLoading.set(false);
      }
    });
  }

  isInscrito(clase: Clase): boolean {
    return (clase as unknown as Record<string, unknown>)['status'] === 'INSCRITO';
  }

  inscribirse(clase: Clase) {
    this.inscripcionesEnCurso.update(set => {
      const newSet = new Set(set);
      newSet.add(clase.id);
      return newSet;
    });
    
    // Usamos responseType: 'text' para evitar parsear JSON en respuestas vacías
    this.http.post(`${this.apiUrl}/clases/${clase.id}/inscribir`, {}, { responseType: 'text' }).subscribe({
      next: () => {
        this.inscripcionesEnCurso.update(set => {
          const newSet = new Set(set);
          newSet.delete(clase.id);
          return newSet;
        });
        this.cargarClases();
      },
      error: (err) => {
        this.inscripcionesEnCurso.update(set => {
          const newSet = new Set(set);
          newSet.delete(clase.id);
          return newSet;
        });
        // El interceptor normaliza el error
        alert('No se pudo completar la inscripcion: ' + (err.error || err.message));
      }
    });
  }
}
