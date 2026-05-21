import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityLogService, ActivityLog } from '../../shared/activity-log.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-logs.html',
  styleUrl: './admin-logs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLogsComponent implements OnInit {
  private readonly logService = inject(ActivityLogService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly activityLog = inject(ActivityLogService);

  readonly filtro = signal('');
  readonly paginaActual = signal(1);
  readonly itemsPorPagina = signal(25);
  readonly isLoading = signal(false);

  readonly logsFiltrados = computed(() => {
    return this.logService.getFilteredLogs(this.filtro());
  });

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.logsFiltrados().length / this.itemsPorPagina()) || 1;
  });

  readonly logsPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.itemsPorPagina();
    const fin = inicio + this.itemsPorPagina();
    return this.logsFiltrados().slice(inicio, fin);
  });

  readonly infoPaginacion = computed(() => {
    const total = this.logsFiltrados().length;
    const inicio = total === 0 ? 0 : (this.paginaActual() - 1) * this.itemsPorPagina() + 1;
    const fin = Math.min(this.paginaActual() * this.itemsPorPagina(), total);
    return { inicio, fin, total };
  });

  ngOnInit() {
    // Logs cargados automáticamente por el servicio
  }

  filtrarLogs() {
    this.paginaActual.set(1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  clearLogs() {
    this.confirmDialog.confirm({
      title: 'Clear history',
      message: 'Are you sure you want to clear all activity history? This action cannot be undone.',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isLoading.set(true);
        this.activityLog.log('LIMPIAR', 'AUDITORIA', 'Activity history cleared by admin');
        this.logService.clearLogs();
        this.isLoading.set(false);
      }
    });
  }

  formatFecha(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'crear': return 'fa-plus-circle';
      case 'editar':
      case 'actualizar': return 'fa-edit';
      case 'eliminar': return 'fa-trash-alt';
      case 'anular': return 'fa-times-circle';
      case 'cambiar':
      case 'cambiar_estado':
      case 'cambiar_rol':
      case 'cambiar_pago': return 'fa-exchange-alt';
      case 'exportar': return 'fa-file-export';
      case 'limpiar': return 'fa-broom';
      default: return 'fa-info-circle';
    }
  }

  getActionColor(action: string): string {
    switch (action.toLowerCase()) {
      case 'crear': return 'action-create';
      case 'editar':
      case 'actualizar': return 'action-edit';
      case 'eliminar': return 'action-delete';
      case 'anular': return 'action-delete';
      case 'cambiar':
      case 'cambiar_estado':
      case 'cambiar_rol':
      case 'cambiar_pago': return 'action-edit';
      case 'exportar': return 'action-export';
      case 'limpiar': return 'action-delete';
      default: return 'action-default';
    }
  }
}
