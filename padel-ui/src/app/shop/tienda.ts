import { Component, OnInit, signal, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService } from './producto.service';
import { CarritoService } from './carrito.service';
import { PedidoService } from './pedido.service';
import { NotificationService } from '../shared/notification.service';
import type { Producto, CategoriaProducto, CarritoItem } from '../shared/models';

type Ordenamiento = 'nombre' | 'precio-asc' | 'precio-desc' | 'stock';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './tienda.html',
  styleUrl: './tienda.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiendaComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly carritoService = inject(CarritoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly notificationService = inject(NotificationService);

  readonly productos = signal<Producto[]>([]);
  readonly categoriaSeleccionada = signal<CategoriaProducto | 'TODAS'>('TODAS');
  readonly terminoBusqueda = signal('');
  readonly ordenamiento = signal<Ordenamiento>('nombre');
  readonly isLoading = signal(true);
  readonly carritoVisible = signal(false);
  readonly carritoItems = signal<CarritoItem[]>([]);
  readonly carritoTotal = signal(0);
  readonly productoAgregado = signal<number | null>(null);

  readonly categorias: { value: CategoriaProducto | 'TODAS'; label: string }[] = [
    { value: 'TODAS', label: 'All' },
    { value: 'PALAS', label: 'Paddles' },
    { value: 'ROPA', label: 'Clothing' },
    { value: 'ACCESORIOS', label: 'Accessories' }
  ];

  readonly ordenamientos: { value: Ordenamiento; label: string }[] = [
    { value: 'nombre', label: 'Name' },
    { value: 'precio-asc', label: 'Price: Low to High' },
    { value: 'precio-desc', label: 'Price: High to Low' },
    { value: 'stock', label: 'Stock' }
  ];

  readonly productosFiltrados = computed(() => {
    let resultado = [...this.productos()];

    if (this.categoriaSeleccionada() !== 'TODAS') {
      resultado = resultado.filter(p => p.categoria === this.categoriaSeleccionada());
    }

    const termino = this.terminoBusqueda().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
      );
    }

    switch (this.ordenamiento()) {
      case 'nombre':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'precio-asc':
        resultado.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
      case 'stock':
        resultado.sort((a, b) => b.stock - a.stock);
        break;
    }

    return resultado;
  });

  ngOnInit() {
    this.cargarProductos();
    this.cargarCarrito();
  }

  cargarProductos() {
    this.isLoading.set(true);
    this.productoService.getProductos().subscribe({
      next: (datos) => {
        this.productos.set(datos);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filtrarPorCategoria(categoria: CategoriaProducto | 'TODAS') {
    this.categoriaSeleccionada.set(categoria);
  }

  onBusquedaChange(valor: string) {
    this.terminoBusqueda.set(valor);
  }

  onOrdenamientoChange(valor: Ordenamiento) {
    this.ordenamiento.set(valor);
  }

  agregarAlCarrito(producto: Producto) {
    if (producto.stock <= 0) {
      this.notificationService.error('Product out of stock');
      return;
    }

    this.productoAgregado.set(producto.id);
    setTimeout(() => this.productoAgregado.set(null), 1500);

    this.carritoService.agregarAlCarrito(producto.id, 1).subscribe({
      next: () => {
        this.notificationService.success(`${producto.nombre} added to cart`);
        this.cargarCarrito();
      },
      error: (err) => {
        this.notificationService.error(err.error || 'Could not add item to cart. Please try again.');
      }
    });
  }

  cargarCarrito() {
    this.carritoService.getCarrito().subscribe(items => {
      this.carritoItems.set(items);
      const total = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
      this.carritoTotal.set(total);
    });
  }

  actualizarCantidadItem(itemId: number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminarItem(itemId);
      return;
    }
    this.carritoService.actualizarCantidad(itemId, cantidad).subscribe({
      next: () => this.cargarCarrito(),
      error: (err) =>         this.notificationService.error(err.error || 'Could not update cart quantity. Please try again.')
    });
  }

  eliminarItem(itemId: number) {
    this.carritoService.eliminarItem(itemId).subscribe({
      next: () => {
        this.cargarCarrito();
        this.notificationService.info('Product removed from cart');
      },
      error: (err) =>         this.notificationService.error(err.error || 'Could not remove item from cart. Please try again.')
    });
  }

  checkout() {
    this.pedidoService.checkout().subscribe({
      next: (pedido) => {
        this.notificationService.success(`Order #${pedido.id} placed successfully. Total: ${pedido.total.toFixed(2)}€`);
        this.carritoItems.set([]);
        this.carritoTotal.set(0);
        this.carritoVisible.set(false);
        this.cargarProductos();
      },
      error: (err) => {
        this.notificationService.error(err.error || 'Could not place order. Please try again.');
      }
    });
  }

  toggleCarrito() {
    this.carritoVisible.update(v => !v);
  }
}
