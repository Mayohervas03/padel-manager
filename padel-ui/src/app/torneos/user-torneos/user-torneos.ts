import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TorneoService } from '../torneo.service';
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

  readonly torneos = signal<Torneo[]>([]);
  readonly modalVisible = signal(false);
  readonly torneoSeleccionado = signal<Torneo | null>(null);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');
  readonly isLoading = signal(true);

  readonly requestInscripcion = signal({
    nombreCompanero: '',
    categoria: ''
  });

  readonly categorias = ['Oro', 'Plata', 'Bronce', '2ª Categoría', '3ª Categoría', '4ª Categoría'];

  ngOnInit() {
    this.cargarTorneos();
  }

  cargarTorneos() {
    this.isLoading.set(true);
    this.torneoService.getTorneosActivos().subscribe({
      next: (datos) => {
        this.torneos.set(datos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando torneos', err);
        this.isLoading.set(false);
      }
    });
  }

  abrirModal(torneo: Torneo) {
    this.torneoSeleccionado.set(torneo);
    this.requestInscripcion.set({ nombreCompanero: '', categoria: '' });
    this.modalVisible.set(true);
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.torneoSeleccionado.set(null);
  }

  inscribirse() {
    const req = this.requestInscripcion();
    if (!req.nombreCompanero || !req.categoria) {
      this.mensajeError.set('Debes completar todos los campos.');
      return;
    }

    const torneo = this.torneoSeleccionado();
    if (!torneo) return;

    this.torneoService.inscribirse(torneo.id, req).subscribe({
      next: () => {
        this.mensajeExito.set('Inscripcion registrada! Recuerda abonar la cuota en el club para confirmar tu plaza.');
        this.mensajeError.set('');
        setTimeout(() => {
          this.cerrarModal();
        }, 3000);
      },
      error: (err) => {
        this.mensajeExito.set('');
        // El interceptor normaliza el error: err.error es un string con el mensaje
        this.mensajeError.set(err.error || 'Ocurrió un error al inscribirse.');
      }
    });
  }
}
