import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PedidoService } from '../../shop/pedido.service';
import { NotificationService } from '../../shared/notification.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import type { Pedido } from '../../shared/models';

type FiltroEstado = 'TODOS' | 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly isLoading = signal(true);
  readonly filtroEstado = signal<FiltroEstado>('TODOS');
  readonly filtroBusqueda = signal('');

  readonly estados: { value: FiltroEstado; label: string }[] = [
    { value: 'TODOS', label: 'All' },
    { value: 'PENDIENTE', label: 'Pending' },
    { value: 'COMPLETADO', label: 'Completed' },
    { value: 'CANCELADO', label: 'Canceled' }
  ];

  readonly pedidosFiltrados = computed(() => {
    let filtrados = this.pedidos();

    if (this.filtroEstado() !== 'TODOS') {
      filtrados = filtrados.filter(p => p.estado === this.filtroEstado());
    }

    const q = this.filtroBusqueda().toLowerCase().trim();
    if (q) {
      filtrados = filtrados.filter(p =>
        p.id.toString().includes(q) ||
        p.items.some(i => i.producto.nombre.toLowerCase().includes(q))
      );
    }

    return filtrados;
  });

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.isLoading.set(true);
    this.pedidoService.getAllPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.error(err);
        this.isLoading.set(false);
      }
    });
  }

  async cambiarEstado(pedido: Pedido, nuevoEstado: string) {
    if (pedido.estado === nuevoEstado) return;

    const confirmado = await firstValueFrom(this.confirmDialog.confirm({
      title: 'Change Status',
      message: `Change order #${pedido.id} from "${pedido.estado}" to "${nuevoEstado}"?`,
      confirmText: 'Change',
      cancelText: 'Cancel'
    }));

    if (!confirmado) return;

    this.pedidoService.cambiarEstadoPedido(pedido.id, nuevoEstado).subscribe({
      next: () => {
        this.notificationService.success(`Order #${pedido.id} updated to ${nuevoEstado}`);
        this.cargarPedidos();
      },
      error: (err) => {
        this.notificationService.error(err);
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'COMPLETADO': return 'estado-completado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return '';
    }
  }
}
