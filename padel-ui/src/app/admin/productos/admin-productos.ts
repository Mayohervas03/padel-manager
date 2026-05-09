import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../shop/producto.service';
import { NotificationService } from '../../shared/notification.service';
import { ExportService } from '../../shared/export.service';
import { ActivityLogService } from '../../shared/activity-log.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import type { Producto, CategoriaProducto } from '../../shared/models';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductosComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly notificationService = inject(NotificationService);
  private readonly exportService = inject(ExportService);
  private readonly activityLog = inject(ActivityLogService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly productos = signal<Producto[]>([]);
  readonly mostrarFormulario = signal(false);
  readonly isLoading = signal(true);

  // Filtros
  readonly filtroBusqueda = signal('');
  readonly filtroCategoria = signal<'TODAS' | CategoriaProducto>('TODAS');
  readonly filtroActivo = signal<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');

  // Paginación
  readonly paginaActual = signal(1);
  readonly itemsPorPagina = signal(10);
  readonly opcionesItemsPorPagina = [10, 25, 50];

  readonly categorias: CategoriaProducto[] = ['PALAS', 'ROPA', 'ACCESORIOS'];

  productoEditando: Partial<Producto> = this.resetProducto();

  readonly productosFiltrados = computed(() => {
    let filtrados = this.productos();

    const q = this.filtroBusqueda().toLowerCase();
    if (q) {
      filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(q));
    }

    if (this.filtroCategoria() !== 'TODAS') {
      filtrados = filtrados.filter(p => p.categoria === this.filtroCategoria());
    }

    if (this.filtroActivo() !== 'TODOS') {
      const activo = this.filtroActivo() === 'ACTIVO';
      filtrados = filtrados.filter(p => p.activo === activo);
    }

    return filtrados;
  });

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.productosFiltrados().length / this.itemsPorPagina()) || 1;
  });

  readonly productosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.itemsPorPagina();
    const fin = inicio + this.itemsPorPagina();
    return this.productosFiltrados().slice(inicio, fin);
  });

  readonly infoPaginacion = computed(() => {
    const total = this.productosFiltrados().length;
    const inicio = total === 0 ? 0 : (this.paginaActual() - 1) * this.itemsPorPagina() + 1;
    const fin = Math.min(this.paginaActual() * this.itemsPorPagina(), total);
    return { inicio, fin, total };
  });

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.isLoading.set(true);
    this.productoService.getProductosAdmin().subscribe({
      next: (datos) => {
        this.productos.set(datos);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetProducto(): Partial<Producto> {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: 'PALAS',
      imagenUrl: '',
      activo: true
    };
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
    this.productoEditando = this.resetProducto();
  }

  editarProducto(producto: Producto) {
    this.productoEditando = { ...producto };
    this.mostrarFormulario.set(true);
  }

  guardarProducto() {
    const p = this.productoEditando;
    if (!p.nombre || p.precio === undefined || p.precio === null || p.stock === undefined || p.stock === null) {
      this.notificationService.error('Completa los campos obligatorios');
      return;
    }

    if (p.precio < 0) {
      this.notificationService.error('El precio no puede ser negativo');
      return;
    }

    if (p.stock < 0) {
      this.notificationService.error('El stock no puede ser negativo');
      return;
    }

    const payload = {
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      categoria: p.categoria as CategoriaProducto,
      imagenUrl: p.imagenUrl || '',
      activo: p.activo ?? true
    };

    if (p.id) {
      this.productoService.updateProducto(p.id, payload).subscribe({
        next: () => {
          this.activityLog.log('ACTUALIZAR', 'PRODUCTO', `Actualizado ${payload.nombre}`, p.id);
          this.notificationService.success('Producto actualizado');
          this.toggleFormulario();
          this.cargarProductos();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al actualizar')
      });
    } else {
      this.productoService.createProducto(payload).subscribe({
        next: () => {
          this.activityLog.log('CREAR', 'PRODUCTO', `Creado ${payload.nombre}`);
          this.notificationService.success('Producto creado');
          this.toggleFormulario();
          this.cargarProductos();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al crear')
      });
    }
  }

  borrarProducto(id: number) {
    this.confirmDialog.confirm({
      title: 'Eliminar Producto',
      message: '¿Seguro que quieres eliminar este producto?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.productoService.deleteProducto(id).subscribe({
        next: () => {
          this.activityLog.log('ELIMINAR', 'PRODUCTO', `Eliminado producto #${id}`, id);
          this.notificationService.success('Producto eliminado');
          this.cargarProductos();
        },
        error: (err) => this.notificationService.error(err.error || 'Error al eliminar')
      });
    });
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

  aplicarFiltros() {
    this.paginaActual.set(1);
  }

  exportarCSV() {
    const datos = this.productosFiltrados().map(p => ({
      ID: p.id,
      Nombre: p.nombre,
      Descripcion: p.descripcion,
      Categoria: p.categoria,
      Precio: p.precio,
      Stock: p.stock,
      Activo: p.activo ? 'Si' : 'No'
    }));
    this.exportService.exportToCSV(datos, 'productos');
    this.activityLog.log('EXPORTAR', 'PRODUCTO', `Exportados ${datos.length} productos a CSV`);
    this.notificationService.success('Productos exportados correctamente');
  }
}
