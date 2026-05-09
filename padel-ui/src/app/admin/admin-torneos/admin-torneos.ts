import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TorneoService } from '../../torneos/torneo.service';
import { NotificationService } from '../../shared/notification.service';
import { ExportService } from '../../shared/export.service';
import { ActivityLogService } from '../../shared/activity-log.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { TorneoFormDialogComponent, type TorneoFormData } from './torneo-form-dialog/torneo-form-dialog';
import type { Torneo } from '../../shared/models';

@Component({
  selector: 'app-admin-torneos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, TorneoFormDialogComponent],
  templateUrl: './admin-torneos.html',
  styleUrl: './admin-torneos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTorneosComponent implements OnInit {
  private readonly torneoService = inject(TorneoService);
  private readonly notificationService = inject(NotificationService);
  private readonly exportService = inject(ExportService);
  private readonly activityLog = inject(ActivityLogService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly torneos = signal<Torneo[]>([]);
  readonly torneosFiltrados = signal<Torneo[]>([]);
  readonly filtroTexto = signal('');
  readonly filtroEstado = signal<'TODOS' | 'ABIERTO' | 'CERRADO' | 'CANCELADO'>('TODOS');
  readonly isLoading = signal<number | null>(null);
  readonly torneoEditando = signal<TorneoFormData | null>(null);

  // Paginación
  readonly paginaActual = signal(1);
  readonly itemsPorPagina = signal(10);
  readonly opcionesItemsPorPagina = [10, 25, 50];

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.torneosFiltrados().length / this.itemsPorPagina()) || 1;
  });

  readonly torneosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.itemsPorPagina();
    const fin = inicio + this.itemsPorPagina();
    return this.torneosFiltrados().slice(inicio, fin);
  });

  readonly infoPaginacion = computed(() => {
    const total = this.torneosFiltrados().length;
    const inicio = total === 0 ? 0 : (this.paginaActual() - 1) * this.itemsPorPagina() + 1;
    const fin = Math.min(this.paginaActual() * this.itemsPorPagina(), total);
    return { inicio, fin, total };
  });

  ngOnInit() {
    this.cargarTorneos();
  }

  cargarTorneos() {
    this.torneoService.getTorneos().subscribe({
      next: (datos) => {
        this.torneos.set(datos);
        this.filtrarTorneos();
      },
      error: (err) => this.notificationService.error('Error cargando torneos: ' + (err.error?.message || err.message))
    });
  }

  filtrarTorneos() {
    let lista = [...this.torneos()];

    const texto = this.filtroTexto().toLowerCase();
    if (texto) {
      lista = lista.filter(t => t.titulo.toLowerCase().includes(texto));
    }

    const estado = this.filtroEstado();
    if (estado !== 'TODOS') {
      lista = lista.filter(t => t.estado === estado);
    }

    this.torneosFiltrados.set(lista);
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

  abrirCrearModal() {
    this.torneoEditando.set({
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      precioPareja: 0,
      maxParejas: 16,
      imagenUrl: '',
      estado: 'ABIERTO',
      fechaCierreInscripcion: ''
    });
  }

  abrirEditarModal(torneo: Torneo) {
    this.torneoEditando.set({
      id: torneo.id,
      titulo: torneo.titulo,
      descripcion: torneo.descripcion || '',
      fechaInicio: torneo.fechaInicio,
      fechaFin: torneo.fechaFin,
      precioPareja: torneo.precioPareja,
      maxParejas: torneo.maxParejas,
      imagenUrl: torneo.imagenUrl || '',
      estado: torneo.estado,
      fechaCierreInscripcion: torneo.fechaCierreInscripcion || ''
    });
  }

  cerrarModal() {
    this.torneoEditando.set(null);
  }

  guardarTorneo(datos: TorneoFormData) {
    const editando = this.torneoEditando();
    if (!editando) return;

    if (!datos.titulo || !datos.fechaInicio || !datos.fechaFin) {
      this.notificationService.error('Por favor, rellena los campos obligatorios (Título y Fechas)');
      return;
    }

    if (datos.fechaInicio > datos.fechaFin) {
      this.notificationService.error('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    if ((datos.precioPareja ?? 0) < 0) {
      this.notificationService.error('El precio no puede ser negativo');
      return;
    }

    if ((datos.maxParejas ?? 0) < 1) {
      this.notificationService.error('El máximo de parejas debe ser al menos 1');
      return;
    }

    this.isLoading.set(editando.id ?? -1);
    const operacion = editando.id
      ? this.torneoService.updateTorneo(editando.id, datos as Omit<Torneo, 'id'>)
      : this.torneoService.createTorneo(datos as Omit<Torneo, 'id'>);

    operacion.subscribe({
      next: () => {
        const action = editando.id ? 'ACTUALIZAR' : 'CREAR';
        this.activityLog.log(action, 'TORNEO', `${action === 'CREAR' ? 'Creado' : 'Actualizado'} torneo ${datos.titulo}`, editando.id);
        this.isLoading.set(null);
        this.cerrarModal();
        this.cargarTorneos();
      },
      error: (err) => {
        this.isLoading.set(null);
        this.notificationService.error(err.error?.message || 'Error al guardar el torneo');
      }
    });
  }

  borrarTorneo(id: number) {
    if (this.isLoading() === id) return;

    this.confirmDialog.confirm({
      title: 'Eliminar Torneo',
      message: '¿Estás seguro de borrar este torneo?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(id);
      this.torneoService.deleteTorneo(id).subscribe({
        next: () => {
          this.activityLog.log('ELIMINAR', 'TORNEO', `Eliminado torneo #${id}`, id);
          this.isLoading.set(null);
          this.cargarTorneos();
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error(err.error?.message || 'Error al borrar el torneo');
        }
      });
    });
  }

  cambiarEstado(torneo: Torneo) {
    const estados: Torneo['estado'][] = ['ABIERTO', 'CERRADO', 'CANCELADO'];
    const idx = estados.indexOf(torneo.estado);
    const nuevoEstado = estados[(idx + 1) % estados.length];

    this.confirmDialog.confirm({
      title: 'Cambiar Estado',
      message: `¿Cambiar estado de "${torneo.titulo}" a ${nuevoEstado.toLowerCase()}?`,
      confirmText: 'Cambiar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-primary'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(torneo.id);
      this.torneoService.cambiarEstadoAdmin(torneo.id, nuevoEstado).subscribe({
        next: () => {
          this.activityLog.log('CAMBIAR_ESTADO', 'TORNEO', `Estado cambiado a ${nuevoEstado} para ${torneo.titulo}`, torneo.id);
          this.isLoading.set(null);
          this.cargarTorneos();
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error(err.error?.message || 'Error al cambiar estado');
        }
      });
    });
  }

  exportarCSV() {
    const datos = this.torneosFiltrados().map(t => ({
      ID: t.id,
      Titulo: t.titulo,
      'Fecha Inicio': t.fechaInicio,
      'Fecha Fin': t.fechaFin,
      'Precio Pareja': t.precioPareja,
      'Max Parejas': t.maxParejas,
      Estado: t.estado,
      Inscritos: t.inscripcionesCount || 0
    }));
    this.exportService.exportToCSV(datos, 'torneos');
    this.activityLog.log('EXPORTAR', 'TORNEO', `Exportados ${datos.length} torneos a CSV`);
    this.notificationService.success('Torneos exportados correctamente');
  }
}
