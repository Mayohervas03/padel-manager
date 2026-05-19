import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../shared/api.config';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import type { Usuario } from '../shared/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly mostrarFormulario = signal(false);

  nuevoUsuario: Partial<Usuario> & { password?: string } = {
    id: undefined,
    nombre: '',
    email: '',
    rol: 'USER',
    password: ''
  };

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`)
      .subscribe((datos) => {
        this.usuarios.set(datos);
      });
  }

  guardarUsuario() {
    if (this.nuevoUsuario.id) {
      this.http.put<Usuario>(`${this.apiUrl}/usuarios/${this.nuevoUsuario.id}`, this.nuevoUsuario)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarUsuarios();
        });
    } else {
      this.http.post<Usuario>(`${this.apiUrl}/usuarios`, this.nuevoUsuario)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarUsuarios();
        });
    }
  }

  limpiarFormulario() {
    this.mostrarFormulario.set(false);
    this.nuevoUsuario = { id: undefined, nombre: '', email: '', rol: 'USER', password: '' };
  }

  toggleFormulario() {
    if (this.mostrarFormulario()) {
      this.limpiarFormulario();
    } else {
      this.limpiarFormulario();
      this.mostrarFormulario.set(true);
    }
  }

  editarUsuario(usuario: Usuario) {
    this.nuevoUsuario = { ...usuario, password: '' };
    this.mostrarFormulario.set(true);
  }

  borrarUsuario(id: number) {
    this.confirmDialog.confirm({
      title: 'Borrar Usuario',
      message: '¿Estás seguro de que deseas borrar este usuario?',
      confirmText: 'Borrar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-user-times'
    }).subscribe(result => {
      if (result) {
        this.http.delete(`${this.apiUrl}/usuarios/${id}`)
          .subscribe(() => {
            this.cargarUsuarios();
          });
      }
    });
  }
}
