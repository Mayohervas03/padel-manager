import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../shared/api.config';
import type { Clase, Pista } from '../../shared/models';

@Component({
  selector: 'app-admin-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-clases.html',
  styleUrls: ['./admin-clases.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminClasesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly clases = signal<Clase[]>([]);
  readonly pistas = signal<Pista[]>([]);
  
  // Payload actualizado: enviamos pistaId como campo plano (DTO del backend)
  nuevaClase = {
    titulo: '',
    monitor: '',
    nivel: 'INICIACION' as const,
    precio: 0,
    maxAlumnos: 4,
    fecha: '',
    hora: '',
    pistaId: null as number | null
  };

  ngOnInit() {
    this.cargarPistas();
    this.cargarClases();
  }

  cargarPistas() {
    this.http.get<Pista[]>(`${this.apiUrl}/pistas`).subscribe(data => this.pistas.set(data));
  }

  cargarClases() {
    this.http.get<Clase[]>(`${this.apiUrl}/admin/clases`).subscribe(data => this.clases.set(data));
  }

  crearClase() {
    this.http.post<Clase>(`${this.apiUrl}/admin/clases`, this.nuevaClase).subscribe({
      next: () => {
        this.cargarClases();
        this.nuevaClase = { titulo: '', monitor: '', nivel: 'INICIACION', precio: 0, maxAlumnos: 4, fecha: '', hora: '', pistaId: null };
      },
      error: (err) => {
        // El interceptor normaliza el error
        alert('Error al crear la clase: ' + (err.error || err.message));
      }
    });
  }

  eliminarClase(id: number) {
    if (confirm('¿Borrar esta clase? Todos los alumnos inscritos la perderán.')) {
      this.http.delete(`${this.apiUrl}/admin/clases/${id}`).subscribe({
        next: () => this.cargarClases(),
        error: (err) => alert('Error al eliminar la clase: ' + (err.error || err.message))
      });
    }
  }
}
