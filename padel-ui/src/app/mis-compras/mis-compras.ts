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

  private translateEstado(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'Completed';
      case 'PENDIENTE': return 'Pending';
      case 'CANCELADO': return 'Cancelled';
      default: return estado;
    }
  }

  async descargarRecibo(pedido: Pedido) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header background
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Logo SVG
    try {
      const svgResponse = await fetch('logo.svg');
      const svgText = await svgResponse.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = svgUrl;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 200, 200);
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', margin, 8, 32, 32);
      }
      URL.revokeObjectURL(svgUrl);
    } catch {
      // Fallback sin logo
    }

    // Título del recibo
    doc.setTextColor(204, 255, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELITE PADEL', margin + 38, y + 8);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Purchase Receipt', margin + 38, y + 16);

    // Datos de la empresa (derecha)
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text('Calle del Deporte, 22', pageWidth - margin, y + 4, { align: 'right' });
    doc.text('Phone: 912 345 678', pageWidth - margin, y + 9, { align: 'right' });
    doc.text('admin@padel.com', pageWidth - margin, y + 14, { align: 'right' });

    y = 65;

    // Datos del comprador
    doc.setTextColor(10, 25, 47);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Buyer:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(pedido.usuarioNombre || 'N/A', margin, y);
    y += 6;
    doc.text(pedido.usuarioEmail || 'N/A', margin, y);
    y += 12;

    // Separador entre Buyer y Order
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 8;

    // Info del pedido
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Order #${pedido.id}`, margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    const fecha = new Date(pedido.fecha);
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
    doc.text(`Date: ${fechaStr}`, margin, y);
    y += 8;
    doc.text(`Status: ${this.translateEstado(pedido.estado)}`, margin, y);
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
    doc.text('Qty', pageWidth - margin - 90, y, { align: 'center' });
    doc.text('Price', pageWidth - margin - 50, y, { align: 'right' });
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
      doc.text(item.cantidad.toString(), pageWidth - margin - 90, y, { align: 'center' });
      doc.text(`${item.precioUnitario.toFixed(2)} EUR`, pageWidth - margin - 50, y, { align: 'right' });
      const subtotal = item.cantidad * item.precioUnitario;
      doc.text(`${subtotal.toFixed(2)} EUR`, pageWidth - margin, y, { align: 'right' });
      y += 7;
    }

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Total con fondo destacado
    const totalBoxY = y - 4;
    const totalBoxH = 12;
    doc.setFillColor(245, 247, 250);
    doc.rect(margin + 60, totalBoxY, pageWidth - margin - 60 - margin, totalBoxH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 47);
    doc.text('TOTAL:', pageWidth - margin - 60, y);
    doc.setTextColor(10, 25, 47);
    doc.text(`${pedido.total.toFixed(2)} EUR`, pageWidth - margin, y, { align: 'right' });

    y += 30;

    // Footer
    doc.setDrawColor(10, 25, 47);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your purchase at Elite Padel', pageWidth / 2, y + 15, { align: 'center' });

    doc.save(`receipt-order-${pedido.id}.pdf`);
  }
}
