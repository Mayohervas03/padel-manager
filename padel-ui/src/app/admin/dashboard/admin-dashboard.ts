import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../shared/api.config';
import type { AgendaItem } from '../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly fechaActual = signal(new Date().toISOString().split('T')[0]);
  readonly reservas = signal<AgendaItem[]>([]);

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.http.get<AgendaItem[]>(`${this.apiUrl}/admin/reservas?fecha=${this.fechaActual()}`)
      .subscribe({
        next: (data) => this.reservas.set(data),
        error: (err) => console.error('Error cargando reservas', err)
      });
  }

  onFechaChange() {
    this.cargarReservas();
  }

  calcularHoraFin(horaStr: string): string {
    if (!horaStr) return '';
    const parts = horaStr.split(':');
    const date = new Date();
    date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    date.setMinutes(date.getMinutes() + 90);
    const endH = date.getHours().toString().padStart(2, '0');
    const endM = date.getMinutes().toString().padStart(2, '0');
    return `${endH}:${endM}`;
  }

  anularElemento(item: AgendaItem) {
    if (confirm(`¿Estás seguro de que deseas anular esta ${item.tipo}? Esta acción no se puede deshacer.`)) {
      const url = item.tipo === 'CLASE' 
          ? `${this.apiUrl}/admin/clases/${item.id}`
          : `${this.apiUrl}/admin/reservas/${item.id}`;
          
      this.http.delete(url).subscribe({
        next: () => this.cargarReservas(),
        error: (err) => {
          // El interceptor normaliza el error
          alert('Hubo un error al anular: ' + (err.error || err.message));
        }
      });
    }
  }
}
