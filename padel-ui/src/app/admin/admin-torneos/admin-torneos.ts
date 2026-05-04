import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TorneoService } from '../../torneos/torneo.service';
import type { Torneo, InscripcionTorneo } from '../../shared/models';

@Component({
  selector: 'app-admin-torneos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './admin-torneos.html',
  styleUrl: './admin-torneos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTorneosComponent implements OnInit {
  private readonly torneoService = inject(TorneoService);

  readonly torneos = signal<Torneo[]>([]);
  readonly mostrarFormulario = signal(false);
  readonly mostrarInscritos = signal(false);
  readonly mensajeError = signal('');
  
  nuevoTorneo: Partial<Torneo> = this.resetTorneo();
  torneoActivo: Torneo | null = null;
  inscripcionesActivas: InscripcionTorneo[] = [];

  ngOnInit() {
    this.cargarTorneos();
  }

  cargarTorneos() {
    this.torneoService.getTorneos().subscribe({
      next: (datos) => this.torneos.set(datos),
      error: (err) => console.error('Error cargando torneos', err)
    });
  }

  resetTorneo(): Partial<Torneo> {
    return {
      id: undefined,
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      precioPareja: 0,
      maxParejas: 16,
      imagenUrl: ''
    };
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
    this.mostrarInscritos.set(false);
    this.nuevoTorneo = this.resetTorneo();
    this.mensajeError.set('');
  }

  editarTorneo(t: Torneo) {
    this.nuevoTorneo = { 
      ...t,
      descripcion: t.descripcion || '',
      imagenUrl: t.imagenUrl || ''
    };
    this.mostrarFormulario.set(true);
    this.mostrarInscritos.set(false);
    this.mensajeError.set('');
  }

  guardarTorneo() {
    if (!this.nuevoTorneo.titulo || !this.nuevoTorneo.fechaInicio || !this.nuevoTorneo.fechaFin) {
      alert('Por favor, rellena los campos obligatorios (Titulo y Fechas)');
      return;
    }
    
    const operacion = this.nuevoTorneo.id
      ? this.torneoService.updateTorneo(this.nuevoTorneo.id, this.nuevoTorneo as Omit<Torneo, 'id'>)
      : this.torneoService.createTorneo(this.nuevoTorneo as Omit<Torneo, 'id'>);

    operacion.subscribe({
      next: () => {
        this.toggleFormulario();
        this.cargarTorneos();
      },
      error: (err) => {
        // El interceptor normaliza el error
        this.mensajeError.set(err.error || 'Error al guardar el torneo');
        alert(this.mensajeError());
      }
    });
  }

  borrarTorneo(id: number) {
    if (confirm('¿Estás seguro de borrar este torneo?')) {
      this.torneoService.deleteTorneo(id).subscribe({
        next: () => this.cargarTorneos(),
        error: (err) => {
          alert('Error al borrar el torneo: ' + (err.error || err.message));
        }
      });
    }
  }

  verInscritos(torneo: Torneo) {
    this.torneoActivo = torneo;
    this.torneoService.getInscripciones(torneo.id).subscribe({
      next: (datos) => {
        this.inscripcionesActivas = datos;
        this.mostrarInscritos.set(true);
        this.mostrarFormulario.set(false);
      }
    });
  }

  cerrarInscritos() {
    this.mostrarInscritos.set(false);
    this.torneoActivo = null;
  }

  togglePagado(inscripcion: InscripcionTorneo) {
    this.torneoService.marcarPagado(inscripcion.id, !inscripcion.pagado).subscribe({
      next: (updatedInscripcion) => {
        const idx = this.inscripcionesActivas.findIndex(i => i.id === updatedInscripcion.id);
        if (idx >= 0) {
          this.inscripcionesActivas[idx] = updatedInscripcion;
          // Force update by creating new array reference
          this.inscripcionesActivas = [...this.inscripcionesActivas];
        }
      }
    });
  }
}
