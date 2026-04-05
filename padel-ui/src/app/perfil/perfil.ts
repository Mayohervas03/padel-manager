import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  perfil: any = null;
  reservas: any[] = [];
  clases: any[] = [];
  
  showPasswordForm = false;
  passwordData = { oldPassword: '', newPassword: '' };
  mensajeExito = '';
  mensajeError = '';

  isLoading = true;
  hayError = false;

  constructor(
    private authService: AuthService, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading = true;
    this.hayError = false;
    this.cdr.detectChanges();

    const perfil$ = this.authService.getPerfil().pipe(catchError(err => of(null)));
    
    const tokenOptions = { headers: { Authorization: `Bearer ${this.authService.getToken()}` } };
    
    const reservas$ = this.http.get<any[]>('http://localhost:8080/api/reservas', tokenOptions)
      .pipe(catchError(err => of(null)));
      
    const clases$ = this.http.get<any[]>('http://localhost:8080/api/clases/mis-clases', tokenOptions)
      .pipe(catchError(err => of(null)));

    forkJoin([perfil$, reservas$, clases$]).subscribe({
      next: ([perfilData, reservasData, clasesData]) => {
        if (perfilData === null || reservasData === null || clasesData === null) {
          this.hayError = true;
        } else {
          this.perfil = perfilData;
          this.reservas = reservasData;
          this.clases = clasesData;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hayError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelarReserva(id: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva? REGLA: Mínimo 24h de antelación.')) {
      this.http.delete(`http://localhost:8080/api/reservas/${id}`, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }).subscribe({
        next: () => {
          this.cargarDatos(); // Reload all context safely
          alert('Reserva cancelada correctamente.');
        },
        error: (err) => {
          alert(err.error || 'No se pudo cancelar la reserva. Verifica la antelación (24h).');
        }
      });
    }
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cambiarPassword() {
    this.mensajeExito = '';
    this.mensajeError = '';
    this.authService.cambiarPassword(this.passwordData).subscribe({
      next: (res) => {
        this.mensajeExito = res;
        this.passwordData = { oldPassword: '', newPassword: '' };
        setTimeout(() => this.showPasswordForm = false, 2000);
      },
      error: (err) => {
        this.mensajeError = err.error || 'Error al cambiar contraseña';
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
