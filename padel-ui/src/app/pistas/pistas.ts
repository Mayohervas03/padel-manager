import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PistaService } from './pista.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import type { Pista } from '../shared/models';

@Component({
  selector: 'app-pistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pistas.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PistasComponent implements OnInit {
  private readonly pistaService = inject(PistaService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly authService = inject(AuthService);

  readonly pistas = signal<Pista[]>([]);
  readonly mostrarFormulario = signal(false);

  nuevaPista: Partial<Pista> = {
    id: undefined,
    nombre: '',
    tipo: 'Indoor',
    ubicacion: 'Indoor',
    precio: 0,
    activo: true
  };

  ngOnInit() {
    this.cargarPistas();
  }

  cargarPistas() {
    this.pistaService.getPistas().subscribe({
      next: (datos) => this.pistas.set(datos),
      error: (err) => console.error('Error cargando pistas:', err)
    });
  }

  guardarPista() {
    if (this.nuevaPista.id) {
      this.pistaService.updatePista(this.nuevaPista.id, this.nuevaPista as Omit<Pista, 'id'>)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarPistas();
        });
    } else {
      this.pistaService.createPista(this.nuevaPista as Omit<Pista, 'id'>)
        .subscribe(() => {
          this.limpiarFormulario();
          this.cargarPistas();
        });
    }
  }

  editarPista(pista: Pista) {
    this.nuevaPista = { ...pista };
    this.mostrarFormulario.set(true);
  }

  borrarPista(id: number) {
    this.confirmDialog.confirm({
      title: 'Borrar Pista',
      message: '¿Estás seguro de que deseas borrar esta pista?',
      confirmText: 'Borrar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-trash'
    }).subscribe(result => {
      if (result) {
        this.pistaService.deletePista(id).subscribe(() => {
          this.cargarPistas();
        });
      }
    });
  }

  toggleFormulario() {
    if (this.mostrarFormulario()) {
      this.limpiarFormulario();
    } else {
      this.limpiarFormulario();
      this.mostrarFormulario.set(true);
    }
  }

  limpiarFormulario() {
    this.mostrarFormulario.set(false);
    this.nuevaPista = { id: undefined, nombre: '', tipo: 'Indoor', ubicacion: 'Indoor', precio: 0, activo: true };
  }
}
