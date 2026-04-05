import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-manual',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manual.html',
  styleUrls: ['./admin-manual.scss']
})
export class AdminManualComponent implements OnInit {
  emailBuscado = '';
  usuarioEncontrado: any = null;
  mensajeBusqueda = '';

  reservaData: any = {
    usuarioId: null,
    pistaId: null,
    fecha: '',
    hora: '09:00'
  };

  pistas: any[] = [];

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    const today = new Date();
    this.reservaData.fecha = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarPistas();
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.buscarUsuarioPorId(userId);
      }
    });
  }

  cargarPistas() {
    this.http.get<any[]>('http://localhost:8080/api/pistas').subscribe(data => {
      this.pistas = data;
      this.cdr.detectChanges();
    });
  }

  buscarUsuario() {
    this.mensajeBusqueda = '';
    this.usuarioEncontrado = null;
    this.reservaData.usuarioId = null;
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.emailBuscado) return;

    this.http.get<any>(`http://localhost:8080/api/admin/usuarios/search?email=${this.emailBuscado}`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (user) => {
        this.usuarioEncontrado = user;
        this.reservaData.usuarioId = user.id;
        this.mensajeBusqueda = '✅ Usuario verificado';
        this.checkFormState();
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeBusqueda = '❌ Usuario no encontrado';
        this.checkFormState();
        this.cdr.detectChanges();
      }
    });
  }

  buscarUsuarioPorId(id: number) {
    this.http.get<any>(`http://localhost:8080/api/admin/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (user) => {
        this.usuarioEncontrado = user;
        this.reservaData.usuarioId = user.id;
        this.mensajeBusqueda = '✅ Usuario verificado (desde Gestión)';
        this.checkFormState();
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeBusqueda = '❌ Error al cargar usuario';
        this.cdr.detectChanges();
      }
    });
  }

  checkFormState() {
    console.log('=== ESTADO DEL FORMULARIO ===');
    console.log('Datos Reserva:', this.reservaData);
    console.log('Usuario Asignado:', this.usuarioEncontrado ? this.usuarioEncontrado.nombre : 'NO ASIGNADO');
    const isValid = !!this.usuarioEncontrado && !!this.reservaData.pistaId && !!this.reservaData.fecha && !!this.reservaData.hora;
    console.log('Válido para Confirmar:', isValid);
  }

  crearReserva() {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.reservaData.usuarioId || !this.reservaData.pistaId || !this.reservaData.fecha || !this.reservaData.hora) {
      this.mensajeError = 'Rellena todos los campos';
      return;
    }

    this.http.post('http://localhost:8080/api/admin/reservas/manual', this.reservaData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: () => {
        this.mensajeExito = 'Reserva forzada con éxito.';
        this.reservaData.usuarioId = null;
        this.reservaData.pistaId = null;
        this.usuarioEncontrado = null;
        this.emailBuscado = '';
        this.mensajeBusqueda = '';
        this.checkFormState();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = err.error || 'Error al crear la reserva';
        this.cdr.detectChanges();
      }
    });
  }
}
