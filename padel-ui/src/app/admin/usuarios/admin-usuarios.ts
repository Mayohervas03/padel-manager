import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../shared/api.config';
import type { Usuario } from '../../shared/models';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsuariosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly usuarios = signal<Usuario[]>([]);
  readonly usuariosFiltrados = signal<Usuario[]>([]);
  readonly filtro = signal('');

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<Usuario[]>(`${this.apiUrl}/admin/usuarios`).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.filtrarUsuarios();
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  filtrarUsuarios() {
    const q = this.filtro().toLowerCase();
    if (!q) {
      this.usuariosFiltrados.set([...this.usuarios()]);
    } else {
      this.usuariosFiltrados.set(
        this.usuarios().filter(u => 
          u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        )
      );
    }
  }

  cambiarRol(usuario: Usuario) {
    const nuevoRol = usuario.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    const msg = `¿Seguro que quieres cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`;
    
    if (confirm(msg)) {
      this.http.put<Usuario>(`${this.apiUrl}/admin/usuarios/${usuario.id}/rol`, nuevoRol).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => {
          // El interceptor normaliza el error
          alert('No se pudo cambiar el rol del usuario: ' + (err.error || err.message));
        }
      });
    }
  }

  reservaManual(usuarioId: number) {
    this.router.navigate(['/admin/manual'], { queryParams: { userId: usuarioId } });
  }
}
