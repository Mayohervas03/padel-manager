import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../shop/pedido.service';
import { NotificationService } from '../shared/notification.service';
import type { Pedido } from '../shared/models';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisComprasComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly notificationService = inject(NotificationService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly loading = signal(true);
  readonly pedidoExpandido = signal<number | null>(null);

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading.set(true);
    this.pedidoService.getMisPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notificationService.error(err);
        this.loading.set(false);
      }
    });
  }

  togglePedido(id: number) {
    this.pedidoExpandido.update(current => current === id ? null : id);
  }

  descargarRecibo(pedido: Pedido) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(204, 255, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ELITE PADEL', pageWidth / 2, y + 10, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Purchase Receipt', pageWidth / 2, y + 20, { align: 'center' });

    y = 70;

    // Info del pedido
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Order #${pedido.id}`, margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(pedido.fecha).toLocaleDateString('en-US')}`, margin, y);
    y += 8;
    doc.text(`Status: ${pedido.estado}`, margin, y);
    y += 15;

    // Línea separadora
    doc.setDrawColor(204, 255, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Tabla de items
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Product', margin, y);
    doc.text('Qty', pageWidth - margin - 80, y, { align: 'center' });
    doc.text('Price', pageWidth - margin - 40, y, { align: 'center' });
    doc.text('Subtotal', pageWidth - margin, y, { align: 'right' });
    y += 5;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    for (const item of pedido.items) {
      doc.text(item.producto.nombre, margin, y);
      doc.text(item.cantidad.toString(), pageWidth - margin - 80, y, { align: 'center' });
      doc.text(`${item.precioUnitario.toFixed(2)} EUR`, pageWidth - margin - 40, y, { align: 'center' });
      const subtotal = item.cantidad * item.precioUnitario;
      doc.text(`${subtotal.toFixed(2)} EUR`, pageWidth - margin, y, { align: 'right' });
      y += 7;
    }

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 47);
    doc.text('TOTAL:', pageWidth - margin - 60, y);
    doc.setTextColor(204, 255, 0);
    doc.text(`${pedido.total.toFixed(2)} EUR`, pageWidth - margin, y, { align: 'right' });

    y += 20;

    // Footer
    doc.setDrawColor(10, 25, 47);
    doc.setLineWidth(0.5);
    doc.line(margin, pageWidth - 30, pageWidth - margin, pageWidth - 30);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your purchase at Elite Padel', pageWidth / 2, pageWidth - 20, { align: 'center' });

    doc.save(`recibo-pedido-${pedido.id}.pdf`);
  }
}
