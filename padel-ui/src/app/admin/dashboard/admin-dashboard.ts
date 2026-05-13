import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../shared/api.config';
import { NotificationService } from '../../shared/notification.service';
import { ActivityLogService } from '../../shared/activity-log.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import type { AgendaItem, DashboardStats, EstadoReserva } from '../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly notificationService = inject(NotificationService);
  private readonly activityLog = inject(ActivityLogService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly fechaActual = signal(new Date().toISOString().split('T')[0]);
  readonly reservas = signal<AgendaItem[]>([]);
  readonly pistasActivas = signal<number>(0);
  readonly filtroTipo = signal<'TODOS' | 'RESERVA' | 'CLASE'>('TODOS');
  readonly filtroPista = signal<string>('TODAS');
  readonly isLoading = signal<number | null>(null); // ID de elemento en proceso de anulación

  readonly pistasDisponibles = computed(() => {
    const pistas = new Set(this.reservas().map(r => r.pista?.nombre).filter(Boolean));
    return ['TODAS', ...Array.from(pistas)];
  });

  readonly reservasFiltradas = computed(() => {
    return this.reservas().filter(r => {
      const matchTipo = this.filtroTipo() === 'TODOS' || r.tipo === this.filtroTipo();
      const matchPista = this.filtroPista() === 'TODAS' || r.pista?.nombre === this.filtroPista();
      return matchTipo && matchPista;
    });
  });

  readonly kpis = computed(() => {
    const items = this.reservas();
    const reservasCount = items.filter(i => i.tipo === 'RESERVA').length;
    const clasesCount = items.filter(i => i.tipo === 'CLASE').length;
    const pistasUnicas = new Set(items.map(i => i.pista?.nombre).filter(Boolean)).size;
    const totalItems = items.length;
    const pistasActivas = this.pistasActivas();
    // Capacidad real: pistas activas * 10 slots diarios (aprox 9h-21h con slots de 90min)
    const capacidadTotal = pistasActivas > 0 ? pistasActivas * 10 : 1;
    const ocupacionPct = totalItems > 0 ? Math.round((totalItems / capacidadTotal) * 100) : 0;
    return { reservasCount, clasesCount, pistasUnicas, totalItems, ocupacionPct, pistasActivas };
  });

  ngOnInit() {
    this.cargarReservas();
    this.cargarPistasActivas();
  }

  cargarReservas() {
    this.http.get<AgendaItem[]>(`${this.apiUrl}/admin/reservas?fecha=${this.fechaActual()}`)
      .subscribe({
        next: (data) => this.reservas.set(data),
        error: (err) => console.error('Error cargando reservas', err)
      });
  }

  cargarPistasActivas() {
    this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).subscribe({
      next: (data) => this.pistasActivas.set(data.pistasActivas || 0),
      error: (err) => console.error('Error cargando pistas activas', err)
    });
  }

  onFechaChange() {
    this.cargarReservas();
  }

  setFiltroTipo(tipo: 'TODOS' | 'RESERVA' | 'CLASE') {
    this.filtroTipo.set(tipo);
  }

  setFiltroPista(pista: string) {
    this.filtroPista.set(pista);
  }

  calcularHoraFin(horaStr: string): string {
    if (!horaStr) return '';
    const parts = horaStr.split(':');
    const date = new Date();
    date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    date.setMinutes(date.getMinutes() + 90);
    const endH = date.getHours().toString().padStart(2, '0');
    const endM = date.getMinutes().toString().padStart(2, '0');
    return `${endH}:${endM}`;
  }

  cambiarEstadoReserva(item: AgendaItem, nuevoEstado: EstadoReserva) {
    if (item.tipo !== 'RESERVA' || this.isLoading() === item.id) return;

    const estadoLabels: Record<EstadoReserva, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      COMPLETADA: 'Completada'
    };

    const accion = nuevoEstado === 'CANCELADA' ? 'Anular' : 'Cambiar estado';
    const mensaje = nuevoEstado === 'CANCELADA'
      ? `¿Estás seguro de que deseas anular esta reserva? Esta acción no se puede deshacer.`
      : `¿Confirmar cambio de estado a "${estadoLabels[nuevoEstado]}"?`;

    this.confirmDialog.confirm({
      title: `${accion} reserva`,
      message: mensaje,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmButtonClass: nuevoEstado === 'CANCELADA' ? 'btn-danger' : 'btn-primary'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(item.id);

      const url = `${this.apiUrl}/admin/reservas/${item.id}/estado`;
      this.http.put(url, { estado: nuevoEstado }).subscribe({
        next: () => {
          const accionLabel = nuevoEstado === 'CANCELADA' ? 'ANULAR' : 'CAMBIAR_ESTADO';
          this.activityLog.log(accionLabel, 'RESERVA',
            `Reserva #${item.id} → ${estadoLabels[nuevoEstado]} - ${item.usuario.nombre}`, item.id);
          this.isLoading.set(null);
          this.notificationService.success(`Reserva marcada como ${estadoLabels[nuevoEstado]}`);
          this.cargarReservas();
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error(err);
        }
      });
    });
  }

  anularElemento(item: AgendaItem) {
    if (item.tipo !== 'CLASE' || this.isLoading() === item.id) return;

    this.confirmDialog.confirm({
      title: 'Anular clase',
      message: '¿Estás seguro de que deseas anular esta clase? Esta acción no se puede deshacer.',
      confirmText: 'Anular',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.isLoading.set(item.id);
      const url = `${this.apiUrl}/admin/clases/${item.id}`;

      this.http.delete(url).subscribe({
        next: () => {
          this.activityLog.log('ANULAR', 'CLASE', `Anulada clase #${item.id} - ${item.usuario.nombre}`, item.id);
          this.isLoading.set(null);
          this.cargarReservas();
        },
        error: (err) => {
          this.isLoading.set(null);
          this.notificationService.error(err);
        }
      });
    });
  }
}
