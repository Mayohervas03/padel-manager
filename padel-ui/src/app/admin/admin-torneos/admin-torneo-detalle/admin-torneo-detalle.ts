import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TorneoService } from '../../../torneos/torneo.service';
import { NotificationService } from '../../../shared/notification.service';
import { ActivityLogService } from '../../../shared/activity-log.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { EditarCompaneroDialogComponent, type CompaneroEditData } from '../../../shared/editar-companero-dialog/editar-companero-dialog';
import type { Torneo, InscripcionTorneo, CategoriaTorneo } from '../../../shared/models';

@Component({
  selector: 'app-admin-torneo-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule, EditarCompaneroDialogComponent],
  templateUrl: './admin-torneo-detalle.html',
  styleUrl: './admin-torneo-detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTorneoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly torneoService = inject(TorneoService);
  private readonly notificationService = inject(NotificationService);
  private readonly activityLog = inject(ActivityLogService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly companeroEditData = signal<CompaneroEditData | null>(null);
  readonly isLoadingAction = signal<number | null>(null);

  readonly torneo = signal<Torneo | null>(null);
  readonly inscripciones = signal<InscripcionTorneo[]>([]);
  readonly inscripcionesFiltradas = signal<InscripcionTorneo[]>([]);
  readonly categoriaSeleccionada = signal<string>('All');
  readonly categoriasDisponibles = signal<string[]>(['All']);
  readonly isLoadingPago = signal<number | null>(null);
  readonly recaudacion = computed(() => {
    const precio = this.torneo()?.precioPareja ?? 0;
    const pagados = this.inscripciones().filter(i => i.pagado).length;
    return pagados * precio;
  });
  readonly isLoading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatos(Number(id));
    }
  }

  cargarDatos(id: number) {
    this.isLoading.set(true);
    this.torneoService.getTorneoByIdAdmin(id).subscribe({
      next: (data) => {
        this.torneo.set(data);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notificationService.error('Error loading tournament: ' + (err.error?.message || err.message));
      }
    });

    this.torneoService.getInscripcionesAdmin(id).subscribe({
      next: (data) => {
        this.inscripciones.set(data);
        this.extraerCategorias(data);
        this.filtrarPorCategoria('All');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notificationService.error('Error loading registrations: ' + (err.error?.message || err.message));
      }
    });
  }

  extraerCategorias(data: InscripcionTorneo[]) {
    const cats = new Set(data.map(i => i.categoria?.nombre).filter(Boolean));
    this.categoriasDisponibles.set(['All', ...Array.from(cats)]);
  }

  filtrarPorCategoria(cat: string) {
    this.categoriaSeleccionada.set(cat);
    if (cat === 'All') {
      this.inscripcionesFiltradas.set([...this.inscripciones()]);
    } else {
      this.inscripcionesFiltradas.set(this.inscripciones().filter(i => i.categoria?.nombre === cat));
    }
  }

  togglePago(insc: InscripcionTorneo) {
    if (this.isLoadingPago() === insc.id) return;

    this.isLoadingPago.set(insc.id);
    const nuevoEstado = !insc.pagado;
    this.torneoService.patchPagoAdmin(insc.id, nuevoEstado).subscribe({
      next: (updated) => {
        const list = this.inscripciones().map(i => i.id === updated.id ? updated : i);
        this.inscripciones.set(list);
        this.filtrarPorCategoria(this.categoriaSeleccionada());
        this.activityLog.log('CAMBIAR_PAGO', 'INSCRIPCION', `Payment ${updated.pagado ? 'marked' : 'unmarked'} for registration #${updated.id}`, updated.id);
        this.isLoadingPago.set(null);
      },
      error: (err) => {
        this.isLoadingPago.set(null);
        this.notificationService.error('Error updating payment: ' + (err.error || err.message));
      }
    });
  }

  getInscripcionesPorCategoria(categoriaId: number): number {
    return this.inscripciones().filter(i => i.categoria?.id === categoriaId).length;
  }

  getTotalPlazas(): number {
    return this.torneo()?.categorias?.reduce((sum, cat) => sum + (cat.maxParejas || 0), 0) || 0;
  }

  abrirModalEditar(insc: InscripcionTorneo) {
    this.companeroEditData.set({
      id: insc.id,
      jugadorNombre: insc.usuarioNombre,
      nombreCompanero: insc.nombreCompanero
    });
  }

  cerrarModalEditar() {
    this.companeroEditData.set(null);
  }

  guardarCompanero(nuevoNombre: string) {
    const data = this.companeroEditData();
    if (!data) return;

    if (!nuevoNombre || !nuevoNombre.trim()) {
      this.notificationService.error('Partner name cannot be empty');
      return;
    }

    this.isLoadingAction.set(data.id);
    this.torneoService.updateInscripcionAdmin(data.id, nuevoNombre.trim()).subscribe({
      next: (updated) => {
        const list = this.inscripciones().map(i => i.id === updated.id ? updated : i);
        this.inscripciones.set(list);
        this.filtrarPorCategoria(this.categoriaSeleccionada());
        this.activityLog.log('EDITAR', 'INSCRIPCION', `Partner updated for registration #${updated.id}`, updated.id);
        this.isLoadingAction.set(null);
        this.cerrarModalEditar();
        this.notificationService.success('Partner updated successfully');
      },
      error: (err) => {
        this.isLoadingAction.set(null);
        this.notificationService.error('Error updating partner: ' + (err.error?.message || err.message));
      }
    });
  }

  eliminarPareja(insc: InscripcionTorneo) {
    this.confirmDialog.confirm({
      title: 'Delete Pair',
      message: `Are you sure you want to delete the pair "${insc.usuarioNombre} + ${insc.nombreCompanero}" from the tournament? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-exclamation-triangle'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.isLoadingAction.set(insc.id);
      this.torneoService.deleteInscripcionAdmin(insc.id).subscribe({
        next: () => {
          const list = this.inscripciones().filter(i => i.id !== insc.id);
          this.inscripciones.set(list);
          this.extraerCategorias(list);
          this.filtrarPorCategoria(this.categoriaSeleccionada());
          this.activityLog.log('ELIMINAR', 'INSCRIPCION', `Deleted pair registration #${insc.id}`, insc.id);
          this.isLoadingAction.set(null);
          this.notificationService.success('Pair deleted successfully');
        },
        error: (err) => {
          this.isLoadingAction.set(null);
          this.notificationService.error('Error deleting pair: ' + (err.error?.message || err.message));
        }
      });
    });
  }
}
