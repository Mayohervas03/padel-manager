import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-pistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pistas.html',
  styleUrls: ['../dashboard/admin-dashboard.scss'] // Reutilizamos estilos
})
export class AdminPistasComponent implements OnInit {
  pistas: any[] = [];
  nuevaPista = { nombre: '', tipo: 'Cristal', ubicacion: 'Indoor', precio: 10 };
  pistasUrl = 'http://localhost:8080/api/admin/pistas';

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarPistas();
  }

  cargarPistas() {
    this.http.get<any[]>(this.pistasUrl, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (data) => {
        this.pistas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando pistas', err)
    });
  }

  crearPista() {
    if (!this.nuevaPista.nombre) return;
    
    this.http.post(this.pistasUrl, this.nuevaPista, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: () => {
        this.cargarPistas();
        this.nuevaPista = { nombre: '', tipo: 'Cristal', ubicacion: 'Indoor', precio: 10 };
        this.cdr.detectChanges();
      },
      error: (err) => alert('Error creando pista: ' + err.message)
    });
  }

  borrarPista(id: number) {
    if (confirm('PELIGRO: Borrar la pista eliminará TAMBIÉN todas las reservas asociadas a la misma. ¿Deseas continuar?')) {
      this.http.delete(`${this.pistasUrl}/${id}`, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        responseType: 'text'
      }).subscribe({
        next: () => this.cargarPistas(),
        error: (err) => alert('Error borrando pista: ' + err.message)
      });
    }
  }
}
