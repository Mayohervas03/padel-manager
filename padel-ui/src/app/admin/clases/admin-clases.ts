import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-clases.html',
  styleUrls: ['./admin-clases.scss']
})
export class AdminClasesComponent implements OnInit {
  clases: any[] = [];
  pistas: any[] = [];
  
  nuevaClase = {
    titulo: '',
    monitor: '',
    nivel: 'INICIACION',
    precio: 0,
    maxAlumnos: 4,
    fecha: '',
    hora: '',
    pista: { id: null }
  };

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.cargarPistas();
    this.cargarClases();
  }

  cargarPistas() {
    this.http.get<any[]>('http://localhost:8080/api/pistas', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe(data => this.pistas = data);
  }

  cargarClases() {
    this.http.get<any[]>('http://localhost:8080/api/admin/clases', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe(data => this.clases = data);
  }

  crearClase() {
    this.http.post('http://localhost:8080/api/admin/clases', this.nuevaClase, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: () => {
        this.cargarClases();
        // Reset form
        this.nuevaClase = { titulo: '', monitor: '', nivel: 'INICIACION', precio: 0, maxAlumnos: 4, fecha: '', hora: '', pista: { id: null } };
      },
      error: (err) => alert('Error al crear la clase: ' + (err.error || err.message))
    });
  }

  eliminarClase(id: number) {
    if (confirm('¿Borrar esta clase? Todos los alumnos inscritos la perderán.')) {
      this.http.delete(`http://localhost:8080/api/admin/clases/${id}`, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }).subscribe(() => this.cargarClases());
    }
  }
}
