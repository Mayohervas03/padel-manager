import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TorneoService } from '../torneo.service';
import { NotificationService } from '../../shared/notification.service';
import type { Torneo } from '../../shared/models';

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
  categoria = '';

  readonly categorias = ['Oro', 'Plata', 'Bronce', '2ª Categoría', '3ª Categoría', '4ª Categoría'];

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
        console.error('Error cargando torneos', err);
        this.isLoading.set(false);
      }
    });
  }

  abrirModal(torneo: Torneo) {
    this.torneoSeleccionado.set(torneo);
    this.nombreCompanero = '';
    this.categoria = '';
    this.modalVisible.set(true);
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.torneoSeleccionado.set(null);
  }

  inscribirse() {
    if (!this.nombreCompanero || !this.categoria) {
      this.mensajeError.set('Debes completar todos los campos.');
      return;
    }

    const torneo = this.torneoSeleccionado();
    if (!torneo) return;

    this.torneoService.inscribirse(torneo.id, {
      nombreCompanero: this.nombreCompanero,
      categoria: this.categoria
    }).subscribe({
      next: () => {
        this.mensajeExito.set('Inscripción registrada! Recuerda abonar la cuota en el club para confirmar tu plaza.');
        this.mensajeError.set('');
        setTimeout(() => {
          this.cerrarModal();
          this.cargarTorneos();
        }, 2000);
      },
      error: (err) => {
        this.mensajeExito.set('');
        this.mensajeError.set(err.error || 'Ocurrió un error al inscribirse.');
      }
    });
  }

  getPlazasDisponibles(torneo: Torneo): number {
    return torneo.maxParejas - (torneo.inscripcionesCount || 0);
  }
}
