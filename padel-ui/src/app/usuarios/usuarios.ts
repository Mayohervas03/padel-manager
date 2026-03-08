import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent {
  http = inject(HttpClient);
  cd = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  mostrarFormulario = false;

  nuevoUsuario: any = {
    id: null,
    nombre: '',
    email: '',
    rol: 'JUGADOR',
    password: ''
  };

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get('http://localhost:8080/api/usuarios')
      .subscribe((datos: any) => {
        this.usuarios = datos;
        this.cd.detectChanges();
      });
  }

  guardarUsuario() {
    if (this.nuevoUsuario.id) {
      this.http.put(`http://localhost:8080/api/usuarios/${this.nuevoUsuario.id}`, this.nuevoUsuario)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarUsuarios();
        });
    } else {
      this.http.post('http://localhost:8080/api/usuarios', this.nuevoUsuario)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarUsuarios();
        });
    }
  }

  limpiarFormulario() {
    this.mostrarFormulario = false;
    this.nuevoUsuario = { id: null, nombre: '', email: '', rol: 'JUGADOR', password: '' };
  }

  toggleFormulario() {
    if (this.mostrarFormulario) {
      this.limpiarFormulario();
    } else {
      this.limpiarFormulario();
      this.mostrarFormulario = true;
    }
  }

  editarUsuario(usuario: any) {
    this.nuevoUsuario = { ...usuario };
    if (!this.nuevoUsuario.password) {
      this.nuevoUsuario.password = '';
    }
    this.mostrarFormulario = true;
  }

  borrarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas borrar este usuario?')) {
      this.http.delete(`http://localhost:8080/api/usuarios/${id}`)
        .subscribe(() => {
          this.cargarUsuarios();
        });
    }
  }
}

