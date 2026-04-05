import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  fechaActual: string;
  reservas: any[] = [];
  adminUrl = 'http://localhost:8080/api/admin/reservas';

  constructor(private http: HttpClient, private authService: AuthService) {
    const today = new Date();
    // Formato YYYY-MM-DD
    this.fechaActual = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.http.get<any[]>(`${this.adminUrl}?fecha=${this.fechaActual}`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (data) => this.reservas = data,
      error: (err) => console.error('Error cargando reservas', err)
    });
  }

  onFechaChange() {
    this.cargarReservas();
  }

  calcularHoraFin(horaStr: string): string {
    if (!horaStr) return '';
    // Formato HH:mm:ss o HH:mm
    const parts = horaStr.split(':');
    let date = new Date();
    date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    
    // Sumar 90 minutos
    date.setMinutes(date.getMinutes() + 90);
    
    let endH = date.getHours().toString().padStart(2, '0');
    let endM = date.getMinutes().toString().padStart(2, '0');
    return `${endH}:${endM}`;
  }

  anularElemento(item: any) {
    if (confirm(`¿Estás seguro de que deseas anular esta ${item.tipo}? Esta acción no se puede deshacer.`)) {
      const url = item.tipo === 'CLASE' 
          ? `http://localhost:8080/api/admin/clases/${item.id}`
          : `${this.adminUrl}/${item.id}`;
          
      this.http.delete(url, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }).subscribe({
        next: () => {
          this.cargarReservas();
        },
        error: (err) => {
          alert('Hubo un error al anular: ' + (err.error || err.message));
        }
      });
    }
  }
}
