import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TorneoService } from '../torneo.service';
import { NotificationService } from '../../shared/notification.service';
import type { Torneo, CategoriaTorneo } from '../../shared/models';

@Component({
  selector: 'app-user-torneos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './user-torneos.html',
  styleUrl: './user-torneos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTorneosComponent implements OnInit {
  private readonly torneoService = inject(TorneoService);
  private readonly notificationService = inject(NotificationService);

  readonly torneos = signal<Torneo[]>([]);
  readonly modalVisible = signal(false);
  readonly torneoSeleccionado = signal<Torneo | null>(null);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');
  readonly isLoading = signal(true);

  // Propiedades planas para ngModel
  nombreCompanero = '';
  categoriaId: number | null = null;

  ngOnInit() {
    this.cargarTorneos();
  }

  cargarTorneos() {
    this.isLoading.set(true);
    
    // Cargar torneos activos y mis inscripciones en paralelo
    this.torneoService.getTorneosActivos().subscribe({
      next: (torneosData) => {
        this.torneoService.getMisInscripciones().subscribe({
          next: (inscripciones) => {
            const torneosConInscripcion = torneosData.map(t => ({
              ...t,
              yaInscrito: inscripciones.some(i => i.torneoId === t.id),
              inscripcionesCount: t.inscripcionesCount || 0
            }));
            this.torneos.set(torneosConInscripcion);
            this.isLoading.set(false);
          },
          error: () => {
            this.torneos.set(torneosData);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading tournaments', err);
        this.isLoading.set(false);
      }
    });
  }

  abrirModal(torneo: Torneo) {
    this.torneoSeleccionado.set(torneo);
    this.nombreCompanero = '';
    this.categoriaId = null;
    this.modalVisible.set(true);
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.torneoSeleccionado.set(null);
  }

  inscribirse() {
    if (!this.nombreCompanero || !this.categoriaId) {
      this.mensajeError.set('You must fill in all fields.');
      return;
    }

    const torneo = this.torneoSeleccionado();
    if (!torneo) return;

    this.torneoService.inscribirse(torneo.id, {
      nombreCompanero: this.nombreCompanero,
      categoriaId: this.categoriaId
    }).subscribe({
      next: () => {
        this.mensajeExito.set('Registration recorded! Remember to pay the fee at the club to confirm your spot.');
        this.mensajeError.set('');
        setTimeout(() => {
          this.cerrarModal();
          this.cargarTorneos();
        }, 2000);
      },
      error: (err) => {
        this.mensajeExito.set('');
        this.notificationService.error(err);
      }
    });
  }

  getTotalPlazas(torneo: Torneo): number {
    return torneo.categorias?.reduce((sum, cat) => sum + (cat.maxParejas || 0), 0) || 0;
  }

  getPlazasDisponibles(torneo: Torneo): number {
    return this.getTotalPlazas(torneo) - (torneo.inscripcionesCount || 0);
  }

  getPlazasDisponiblesCategoria(torneo: Torneo, categoria: CategoriaTorneo): number {
    // Esto es una aproximación. En realidad necesitaríamos el conteo por categoría del backend.
    // Por ahora asumimos que las inscripciones están distribuidas equitativamente o usamos el total.
    return categoria.maxParejas - (categoria.inscripcionesCount || 0);
  }
}
