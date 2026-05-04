import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TorneoService } from '../../../torneos/torneo.service';
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

  readonly torneo = signal<Torneo | null>(null);
  readonly inscripciones = signal<InscripcionTorneo[]>([]);
  readonly inscripcionesFiltradas = signal<InscripcionTorneo[]>([]);
  readonly categoriaSeleccionada = signal('Todas');
  readonly categorias = signal<string[]>(['Todas']);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatos(Number(id));
    }
  }

  cargarDatos(id: number) {
    this.torneoService.getTorneoByIdAdmin(id).subscribe(data => {
      this.torneo.set(data);
    });

    this.torneoService.getInscripcionesAdmin(id).subscribe(data => {
      this.inscripciones.set(data);
      this.extraerCategorias(data);
      this.filtrarPorCategoria('Todas');
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
    const nuevoEstado = !insc.pagado;
    this.torneoService.patchPagoAdmin(insc.id, nuevoEstado).subscribe({
      next: (updated) => {
        const list = this.inscripciones().map(i => i.id === updated.id ? updated : i);
        this.inscripciones.set(list);
        this.filtrarPorCategoria(this.categoriaSeleccionada());
      },
      error: (err) => {
        // El interceptor normaliza el error
        console.error('Error al actualizar pago', err);
        alert('Error al actualizar pago: ' + (err.error || err.message));
      }
    });
  }
}
