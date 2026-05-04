import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../shared/api.config';
import type { Pista } from '../../shared/models';

@Component({
  selector: 'app-admin-pistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pistas.html',
  styleUrls: ['../dashboard/admin-dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPistasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly pistas = signal<Pista[]>([]);
  
  nuevaPista: Omit<Pista, 'id'> = {
    nombre: '', tipo: 'Cristal', ubicacion: 'Indoor', precio: 10, activo: true
  };

  ngOnInit() {
    this.cargarPistas();
  }

  cargarPistas() {
    this.http.get<Pista[]>(`${this.apiUrl}/admin/pistas`).subscribe({
      next: (data) => this.pistas.set(data),
      error: (err) => console.error('Error cargando pistas', err)
    });
  }

  crearPista() {
    if (!this.nuevaPista.nombre) return;
    
    this.http.post<Pista>(`${this.apiUrl}/admin/pistas`, this.nuevaPista).subscribe({
      next: () => {
        this.cargarPistas();
        this.nuevaPista = { nombre: '', tipo: 'Cristal', ubicacion: 'Indoor', precio: 10, activo: true };
      },
      error: (err) => {
        // El interceptor normaliza el error
        alert('Error creando pista: ' + (err.error || err.message));
      }
    });
  }

  borrarPista(id: number) {
    if (confirm('PELIGRO: Borrar la pista eliminará TAMBIÉN todas las reservas asociadas a la misma. ¿Deseas continuar?')) {
      // Usamos responseType: 'text' para manejar respuestas vacías o texto plano
      this.http.delete(`${this.apiUrl}/admin/pistas/${id}`, { responseType: 'text' }).subscribe({
        next: () => this.cargarPistas(),
        error: (err) => {
          alert('Error borrando pista: ' + (err.error || err.message));
        }
      });
    }
  }
}
