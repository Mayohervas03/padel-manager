import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Torneo, CategoriaTorneo } from '../../../shared/models';

export interface CategoriaFormData {
  nombre: string;
  maxParejas: number;
}

export interface TorneoFormData {
  id?: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  precioPareja: number;
  categorias: CategoriaFormData[];
  imagenUrl: string;
  estado: Torneo['estado'];
  fechaCierreInscripcion: string;
}

@Component({
  selector: 'app-torneo-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './torneo-form-dialog.html',
  styleUrl: './torneo-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TorneoFormDialogComponent {
  readonly torneo = input.required<TorneoFormData>();
  readonly guardar = output<TorneoFormData>();
  readonly cerrar = output<void>();

  readonly titulo = signal('');
  readonly descripcion = signal('');
  readonly fechaInicio = signal('');
  readonly fechaFin = signal('');
  readonly precioPareja = signal(0);
  readonly categorias = signal<CategoriaFormData[]>([{ nombre: '', maxParejas: 8 }]);
  readonly imagenUrl = signal('');
  readonly estado = signal<Torneo['estado']>('ABIERTO');
  readonly fechaCierreInscripcion = signal('');

  ngOnInit() {
    const t = this.torneo();
    this.titulo.set(t.titulo || '');
    this.descripcion.set(t.descripcion || '');
    this.fechaInicio.set(t.fechaInicio || '');
    this.fechaFin.set(t.fechaFin || '');
    this.precioPareja.set(t.precioPareja ?? 0);
    this.categorias.set(t.categorias?.length > 0 ? t.categorias : [{ nombre: '', maxParejas: 8 }]);
    this.imagenUrl.set(t.imagenUrl || '');
    this.estado.set(t.estado || 'ABIERTO');
    this.fechaCierreInscripcion.set(t.fechaCierreInscripcion || '');
  }

  agregarCategoria() {
    this.categorias.update(cats => [...cats, { nombre: '', maxParejas: 8 }]);
  }

  eliminarCategoria(index: number) {
    this.categorias.update(cats => cats.filter((_, i) => i !== index));
  }

  actualizarCategoria(index: number, campo: 'nombre' | 'maxParejas', valor: string | number) {
    this.categorias.update(cats => {
      const nuevas = [...cats];
      nuevas[index] = { ...nuevas[index], [campo]: valor };
      return nuevas;
    });
  }

  onGuardar() {
    this.guardar.emit({
      titulo: this.titulo(),
      descripcion: this.descripcion(),
      fechaInicio: this.fechaInicio(),
      fechaFin: this.fechaFin(),
      precioPareja: this.precioPareja(),
      categorias: this.categorias(),
      imagenUrl: this.imagenUrl(),
      estado: this.estado(),
      fechaCierreInscripcion: this.fechaCierreInscripcion()
    });
  }

  onCerrar() {
    this.cerrar.emit();
  }
}
