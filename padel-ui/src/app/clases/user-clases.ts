import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-user-clases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-clases.html',
  styleUrls: ['./user-clases.scss']
})
export class UserClasesComponent implements OnInit {
  clasesDisponibles: any[] = [];
  inscripcionesEnCurso: { [key: number]: boolean } = {}; // Para el spinner

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarClases();
  }

  cargarClases() {
    this.http.get<any[]>('http://localhost:8080/api/clases/disponibles', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (data) => {
        this.clasesDisponibles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando academia', err)
    });
  }

  isInscrito(clase: any): boolean {
    return clase.status === 'INSCRITO';
  }

  inscribirse(clase: any) {
    this.inscripcionesEnCurso[clase.id] = true;
    
    this.http.post(`http://localhost:8080/api/clases/${clase.id}/inscribir`, {}, {
      responseType: 'text',
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (msg) => {
        this.inscripcionesEnCurso[clase.id] = false;
        clase.status = 'INSCRITO';
        if (!clase.alumnos) clase.alumnos = [];
        clase.alumnos.push({}); // Optimistic update
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.inscripcionesEnCurso[clase.id] = false;
        alert('No se pudo completar la inscripción: ' + (err.error || err.message));
        this.cargarClases(); // Refresh to get valid state
      }
    });
  }
}
