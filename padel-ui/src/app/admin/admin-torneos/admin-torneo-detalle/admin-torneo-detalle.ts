import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TorneoService } from '../../../torneos/torneo.service';
import { NotificationService } from '../../../shared/notification.service';
import { ActivityLogService } from '../../../shared/activity-log.service';
import type { Torneo, InscripcionTorneo } from '../../../shared/models';

@Component({
  selector: 'app-admin-torneo-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './admin-torneo-detalle.html',
  styleUrl: './admin-torneo-detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTorneoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly torneoService = inject(TorneoService);
  private readonly notificationService = inject(NotificationService);
  private readonly activityLog = inject(ActivityLogService);

  readonly torneo = signal<Torneo | null>(null);
  readonly inscripciones = signal<InscripcionTorneo[]>([]);
  readonly inscripcionesFiltradas = signal<InscripcionTorneo[]>([]);
  readonly categoriaSeleccionada = signal('Todas');
  readonly categorias = signal<string[]>(['Todas']);
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
      next: (data) => this.torneo.set(data),
      error: (err) => {
        this.isLoading.set(false);
        this.notificationService.error('Error al cargar el torneo: ' + (err.error?.message || err.message));
      }
    });

    this.torneoService.getInscripcionesAdmin(id).subscribe({
      next: (data) => {
        this.inscripciones.set(data);
        this.extraerCategorias(data);
        this.filtrarPorCategoria('Todas');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notificationService.error('Error al cargar inscripciones: ' + (err.error?.message || err.message));
      }
    });
  }

  extraerCategorias(data: InscripcionTorneo[]) {
    const cats = new Set(data.map(i => i.categoria));
    this.categorias.set(['Todas', ...Array.from(cats)]);
  }

  filtrarPorCategoria(cat: string) {
    this.categoriaSeleccionada.set(cat);
    if (cat === 'Todas') {
      this.inscripcionesFiltradas.set([...this.inscripciones()]);
    } else {
      this.inscripcionesFiltradas.set(this.inscripciones().filter(i => i.categoria === cat));
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
        this.activityLog.log('CAMBIAR_PAGO', 'INSCRIPCION', `Pago ${updated.pagado ? 'marcado' : 'desmarcado'} para inscripción #${updated.id}`, updated.id);
        this.isLoadingPago.set(null);
      },
      error: (err) => {
        this.isLoadingPago.set(null);
        this.notificationService.error('Error al actualizar pago: ' + (err.error || err.message));
      }
    });
  }
}
