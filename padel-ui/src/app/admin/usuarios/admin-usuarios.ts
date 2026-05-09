import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../shared/api.config';
import { NotificationService } from '../../shared/notification.service';
import { ExportService } from '../../shared/export.service';
import { ActivityLogService } from '../../shared/activity-log.service';
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { EditarUsuarioDialogComponent } from '../../shared/editar-usuario-dialog/editar-usuario-dialog';
import type { Usuario } from '../../shared/models';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, EditarUsuarioDialogComponent],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsuariosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);
  private readonly exportService = inject(ExportService);
  private readonly activityLog = inject(ActivityLogService);
  private readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly usuariosFiltrados = signal<Usuario[]>([]);
  readonly filtro = signal('');
  readonly isLoading = signal<number | null>(null); // ID de usuario en proceso
  readonly usuarioEditando = signal<Usuario | null>(null);

  // Paginación
  readonly paginaActual = signal(1);
  readonly itemsPorPagina = signal(10);
  readonly opcionesItemsPorPagina = [10, 25, 50];

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.usuariosFiltrados().length / this.itemsPorPagina()) || 1;
  });

  readonly usuariosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.itemsPorPagina();
    const fin = inicio + this.itemsPorPagina();
    return this.usuariosFiltrados().slice(inicio, fin);
  });

  readonly infoPaginacion = computed(() => {
    const total = this.usuariosFiltrados().length;
    const inicio = total === 0 ? 0 : (this.paginaActual() - 1) * this.itemsPorPagina() + 1;
    const fin = Math.min(this.paginaActual() * this.itemsPorPagina(), total);
    return { inicio, fin, total };
  });

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
    this.paginaActual.set(1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  cambiarItemsPorPagina(cantidad: number) {
    this.itemsPorPagina.set(cantidad);
    this.paginaActual.set(1);
  }

  cambiarRol(usuario: Usuario) {
    if (this.isLoading() === usuario.id) return;

    const nuevoRol = usuario.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    
    this.confirmDialog.confirm({
      title: 'Cambiar Rol',
      message: `¿Seguro que quieres cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`,
      confirmText: 'Cambiar Rol',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-primary'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(usuario.id);
      this.http.put<Usuario>(`${this.apiUrl}/admin/usuarios/${usuario.id}/rol`, nuevoRol).subscribe({
        next: () => {
          this.activityLog.log('CAMBIAR_ROL', 'USUARIO', `Rol cambiado a ${nuevoRol} para ${usuario.nombre} (${usuario.email})`, usuario.id);
          this.cargarUsuarios();
          this.isLoading.set(null);
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error('No se pudo cambiar el rol del usuario: ' + (err.error || err.message));
        }
      });
    });
  }

  reservaManual(usuarioId: number) {
    this.router.navigate(['/admin/manual'], { queryParams: { userId: usuarioId } });
  }

  eliminarUsuario(usuario: Usuario) {
    if (this.isLoading() === usuario.id) return;

    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId !== null && usuario.id === currentUserId) {
      this.notificationService.error('No puedes eliminar tu propio usuario');
      return;
    }

    this.confirmDialog.confirm({
      title: 'Eliminar Usuario',
      message: `¿Seguro que quieres eliminar a ${usuario.nombre} (${usuario.email})?\n\nEsta acción no se puede deshacer y eliminará todas sus reservas e inscripciones.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(usuario.id);
      this.http.delete(`${this.apiUrl}/admin/usuarios/${usuario.id}`).subscribe({
        next: () => {
          this.activityLog.log('ELIMINAR', 'USUARIO', `Eliminado ${usuario.nombre} (${usuario.email})`, usuario.id);
          this.cargarUsuarios();
          this.isLoading.set(null);
          this.notificationService.success('Usuario eliminado correctamente');
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error('Error al eliminar el usuario: ' + (err.error || err.message));
        }
      });
    });
  }

  abrirEditarModal(usuario: Usuario) {
    this.usuarioEditando.set(usuario);
  }

  cerrarEditarModal() {
    this.usuarioEditando.set(null);
  }

  guardarEdicion(datos: Partial<Usuario>) {
    const usuario = this.usuarioEditando();
    if (!usuario) return;

    this.isLoading.set(usuario.id);
    this.http.put<Usuario>(`${this.apiUrl}/admin/usuarios/${usuario.id}`, datos).subscribe({
      next: () => {
        this.activityLog.log('EDITAR', 'USUARIO', `Editado ${datos.nombre || usuario.nombre} (${datos.email || usuario.email})`, usuario.id);
        this.cargarUsuarios();
        this.isLoading.set(null);
        this.usuarioEditando.set(null);
        this.notificationService.success('Usuario actualizado correctamente');
      },
      error: (err) => {
        this.isLoading.set(null);
        this.notificationService.error('Error al actualizar el usuario: ' + (err.error?.message || err.message));
      }
    });
  }

  exportarCSV() {
    const datos = this.usuariosFiltrados().map(u => ({
      ID: u.id,
      Nombre: u.nombre,
      Email: u.email,
      Rol: u.rol
    }));
    this.exportService.exportToCSV(datos, 'usuarios');
    this.activityLog.log('EXPORTAR', 'USUARIO', `Exportados ${datos.length} usuarios a CSV`);
    this.notificationService.success('Usuarios exportados correctamente');
  }
}
