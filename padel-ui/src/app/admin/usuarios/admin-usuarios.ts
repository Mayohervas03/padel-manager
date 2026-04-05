import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss']
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtro = '';
  usuariosUrl = 'http://localhost:8080/api/admin/usuarios';

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<any[]>(this.usuariosUrl, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filtrarUsuarios();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  filtrarUsuarios() {
    if (!this.filtro) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const q = this.filtro.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u => 
        u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  cambiarRol(usuario: any) {
    const nuevoRol = usuario.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    const msg = `¿Seguro que quieres cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`;
    
    if (confirm(msg)) {
      this.http.put(`${this.usuariosUrl}/${usuario.id}/rol`, nuevoRol, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al cambiar rol', err);
          alert('No se pudo cambiar el rol del usuario.');
        }
      });
    }
  }

  reservaManual(usuarioId: number) {
    this.router.navigate(['/admin/manual'], { queryParams: { userId: usuarioId } });
  }
}
