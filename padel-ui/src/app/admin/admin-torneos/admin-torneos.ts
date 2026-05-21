import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TorneoService } from '../../torneos/torneo.service';
import { NotificationService } from '../../shared/notification.service';
import { ExportService } from '../../shared/export.service';
import { ActivityLogService } from '../../shared/activity-log.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import type { Torneo } from '../../shared/models';

@Component({
  selector: 'app-admin-torneos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
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
  readonly mostrarFormulario = signal(false);

  // Formulario inline
  torneoEditando: {
    id?: number;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    precioPareja: number;
    categorias: { nombre: string; maxParejas: number }[];
    imagenUrl: string;
    estado: Torneo['estado'];
    fechaCierreInscripcion: string;
  } = this.resetTorneo();

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
      error: (err) => this.notificationService.error('Error loading tournaments: ' + (err.error?.message || err.message))
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

  resetTorneo(): {
    id?: number;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    precioPareja: number;
    categorias: { nombre: string; maxParejas: number }[];
    imagenUrl: string;
    estado: Torneo['estado'];
    fechaCierreInscripcion: string;
  } {
    return {
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      precioPareja: 0,
      categorias: [{ nombre: '', maxParejas: 8 }],
      imagenUrl: '',
      estado: 'ABIERTO',
      fechaCierreInscripcion: ''
    };
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
    this.torneoEditando = this.resetTorneo();
  }

  editarTorneo(torneo: Torneo) {
    this.torneoEditando = {
      id: torneo.id,
      titulo: torneo.titulo,
      descripcion: torneo.descripcion || '',
      fechaInicio: torneo.fechaInicio,
      fechaFin: torneo.fechaFin,
      precioPareja: torneo.precioPareja,
      categorias: torneo.categorias?.map(c => ({ nombre: c.nombre, maxParejas: c.maxParejas })) || [{ nombre: '', maxParejas: 8 }],
      imagenUrl: torneo.imagenUrl || '',
      estado: torneo.estado,
      fechaCierreInscripcion: torneo.fechaCierreInscripcion || ''
    };
    this.mostrarFormulario.set(true);
    // Scroll al formulario
    setTimeout(() => {
      document.querySelector('.form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  guardarTorneo() {
    const t = this.torneoEditando;

    if (!t.titulo?.trim()) {
      this.notificationService.error('Title is required');
      return;
    }
    if (!t.fechaInicio) {
      this.notificationService.error('Start date is required');
      return;
    }
    if (!t.fechaFin) {
      this.notificationService.error('End date is required');
      return;
    }
    if (t.fechaInicio > t.fechaFin) {
      this.notificationService.error('Start date cannot be after end date');
      return;
    }
    if ((t.precioPareja ?? 0) < 0) {
      this.notificationService.error('Price cannot be negative');
      return;
    }
    if (!t.categorias || t.categorias.length === 0) {
      this.notificationService.error('You must define at least one category');
      return;
    }
    for (const cat of t.categorias) {
      if (!cat.nombre?.trim() || (cat.maxParejas ?? 0) < 1) {
        this.notificationService.error('All categories must have a name and at least 1 pair');
        return;
      }
    }

    const payload = {
      titulo: t.titulo.trim(),
      descripcion: t.descripcion || '',
      fechaInicio: t.fechaInicio,
      fechaFin: t.fechaFin,
      precioPareja: t.precioPareja ?? 0,
      categorias: t.categorias,
      imagenUrl: t.imagenUrl || '',
      estado: t.estado || 'ABIERTO',
      fechaCierreInscripcion: t.fechaCierreInscripcion || ''
    };

    this.isLoading.set(t.id ?? -1);
    const operacion = t.id
      ? this.torneoService.updateTorneo(t.id, payload as any)
      : this.torneoService.createTorneo(payload as any);

    operacion.subscribe({
      next: () => {
        const action = t.id ? 'EDITAR' : 'CREAR';
        this.activityLog.log(action, 'TORNEO', `${action === 'CREAR' ? 'Created' : 'Updated'} tournament ${payload.titulo}`, t.id);
        this.isLoading.set(null);
        this.toggleFormulario();
        this.cargarTorneos();
      },
      error: (err) => {
        this.isLoading.set(null);
        this.notificationService.error(err.error?.message || 'Could not save tournament. Please check dates and categories.');
      }
    });
  }

  agregarCategoria() {
    this.torneoEditando.categorias = [...this.torneoEditando.categorias, { nombre: '', maxParejas: 8 }];
  }

  eliminarCategoria(index: number) {
    this.torneoEditando.categorias = this.torneoEditando.categorias.filter((_, i) => i !== index);
  }

  actualizarCategoria(index: number, campo: 'nombre' | 'maxParejas', valor: string | number) {
    const nuevas = [...this.torneoEditando.categorias];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    this.torneoEditando.categorias = nuevas;
  }

  borrarTorneo(id: number) {
    if (this.isLoading() === id) return;

    this.confirmDialog.confirm({
      title: 'Delete Tournament',
      message: 'Are you sure you want to delete this tournament?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(id);
      this.torneoService.deleteTorneo(id).subscribe({
        next: () => {
          this.activityLog.log('ELIMINAR', 'TORNEO', `Deleted tournament #${id}`, id);
          this.isLoading.set(null);
          this.cargarTorneos();
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error(err.error?.message || 'Could not delete tournament. Registrations may exist.');
        }
      });
    });
  }

  cambiarEstado(torneo: Torneo) {
    const estados: Torneo['estado'][] = ['ABIERTO', 'CERRADO', 'CANCELADO'];
    const idx = estados.indexOf(torneo.estado);
    const nuevoEstado = estados[(idx + 1) % estados.length];

    this.confirmDialog.confirm({
      title: 'Change Status',
      message: `Change status of "${torneo.titulo}" to ${nuevoEstado.toLowerCase()}?`,
      confirmText: 'Change',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-primary'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(torneo.id);
      this.torneoService.cambiarEstadoAdmin(torneo.id, nuevoEstado).subscribe({
        next: () => {
          this.activityLog.log('CAMBIAR_ESTADO', 'TORNEO', `Status changed to ${nuevoEstado} for ${torneo.titulo}`, torneo.id);
          this.isLoading.set(null);
          this.cargarTorneos();
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error(err.error?.message || 'Could not change tournament status. Please try again.');
        }
      });
    });
  }

  getTotalPlazas(torneo: Torneo): number {
    return torneo.categorias?.reduce((sum, cat) => sum + (cat.maxParejas || 0), 0) || 0;
  }

  exportarCSV() {
    const datos = this.torneosFiltrados().map(t => ({
      ID: t.id,
      Title: t.titulo,
      'Start Date': t.fechaInicio,
      'End Date': t.fechaFin,
      'Pair Price': t.precioPareja,
      'Categories': t.categorias?.map(c => `${c.nombre} (${c.maxParejas})`).join(', ') || '',
      Status: t.estado,
      Enrolled: t.inscripcionesCount || 0
    }));
    this.exportService.exportToCSV(datos, 'tournaments');
    this.activityLog.log('EXPORTAR', 'TORNEO', `Exported ${datos.length} tournaments to CSV`);
    this.notificationService.success('Tournaments exported successfully');
  }
}
